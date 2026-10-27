import { expect } from "@playwright/test";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";
import {
  TransactionsGetResponse,
  TransactionsListResponse,
} from "../src/common/api/generate/transactions/transactions.zod.gen";

import { test } from "./support/backend-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  timezoneId: "Europe/Moscow",
});

const ACCOUNT_PATH = "/api/v1/accounts/1";

class ResponseBarrier {
  private open = false;
  private pending: Array<() => void> = [];

  get heldCount() {
    return this.pending.length;
  }

  wait() {
    if (this.open) return Promise.resolve();
    return new Promise<void>((resolve) => this.pending.push(resolve));
  }

  release() {
    this.open = true;
    this.pending.splice(0).forEach((resolve) => resolve());
  }
}

for (const colorScheme of ["light", "dark"] as const) {
  for (const scenario of ["expense", "income", "history-first"] as const) {
    test(`independent initial loading: ${scenario}, ${colorScheme}`, async ({
      page,
      backend,
    }, testInfo) => {
      const login = await page.request.get(
        `${backend.url}/api/v1/auth/dev-login`,
      );
      expect(login.ok()).toBeTruthy();
      const list = await page.request.get(
        `${backend.url}${ACCOUNT_PATH}/transactions`,
        {
          params: {
            from: "1970-01-01T00:00:00.000Z",
            to: "2100-01-01T00:00:00.000Z",
          },
        },
      );
      expect(list.ok()).toBeTruthy();
      for (const item of TransactionsListResponse.parse(await list.json())) {
        const deleted = await page.request.delete(
          `${backend.url}${ACCOUNT_PATH}/transactions/${item.id}`,
        );
        expect(deleted.ok()).toBeTruthy();
      }
      const type = scenario === "income" ? "income" : "expense";
      const categoryResponse = await page.request.post(
        `${backend.url}${ACCOUNT_PATH}/categories`,
        {
          data: { type, name: `Первая загрузка ${scenario} ${colorScheme}` },
        },
      );
      expect(categoryResponse.ok()).toBeTruthy();
      const category = CategoriesCreateResponse.parse(
        await categoryResponse.json(),
      );
      const categories = new ResponseBarrier();
      const history = new ResponseBarrier();
      await page.emulateMedia({ colorScheme });
      await page.route("**/api/v1/**", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (request.method() === "GET") {
          if (url.pathname === `${ACCOUNT_PATH}/categories`)
            await categories.wait();
          if (url.pathname === `${ACCOUNT_PATH}/transactions`)
            await history.wait();
        }
        const response = await route.fetch({
          url: backend.url + url.pathname + url.search,
        });
        await route.fulfill({ response });
      });
      const categoryStatus = page.getByRole("status", {
        name: "Загрузка категорий",
      });
      const historyStatus = page.getByRole("status", {
        name: "Загрузка операций",
      });
      try {
        await page.goto("/");
        await expect(categoryStatus).toBeVisible();
        await expect(historyStatus).toBeVisible();
        await expect.poll(() => categories.heldCount).toBeGreaterThan(0);
        await expect.poll(() => history.heldCount).toBeGreaterThan(0);
        await page.getByRole("button", { name: "4", exact: true }).click();
        if (scenario === "history-first") {
          history.release();
          await expect(historyStatus).toHaveCount(0);
          await expect(
            page.getByText("Нет операций за период", { exact: true }),
          ).toBeVisible();
          await expect(categoryStatus).toBeVisible();
          categories.release();
          await expect(
            page.getByRole("button", { name: category.name, exact: true }),
          ).toBeVisible();
        } else {
          if (type === "income")
            await page
              .getByRole("button", { name: "доход", exact: true })
              .click();
          categories.release();
          const categoryButton = page.getByRole("button", {
            name: category.name,
            exact: true,
          });
          await expect(categoryButton).toBeVisible();
          await expect(categoryStatus).toHaveCount(0);
          await expect(historyStatus).toBeVisible();
          const saved = page.waitForResponse(
            (response) =>
              response.request().method() === "POST" &&
              new URL(response.url()).pathname ===
                `${ACCOUNT_PATH}/transactions`,
          );
          await categoryButton.click();
          const response = await saved;
          expect(response.ok()).toBeTruthy();
          expect(
            TransactionsGetResponse.parse(await response.json()),
          ).toMatchObject({
            type,
            amount: 4,
            categoryId: category.id,
          });
          expect(history.heldCount).toBeGreaterThan(0);
          await expect(historyStatus).toBeVisible();
          await page.screenshot({
            path: testInfo.outputPath("categories-ready-history-pending.png"),
          });
          history.release();
          await expect(historyStatus).toHaveCount(0);
          await expect(
            page
              .getByRole("button", { name: new RegExp(category.name) })
              .filter({ hasText: "4 ₽" }),
          ).toBeVisible();
        }
        await expect(categoryStatus).toHaveCount(0);
      } finally {
        categories.release();
        history.release();
      }
    });
  }
}
