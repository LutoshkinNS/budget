import { expect, type Page } from "@playwright/test";

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

const LIST_PATH = "/api/v1/accounts/1/transactions";

class DelayedGet {
  private delaying = false;
  private held: Array<() => void> = [];

  get isDelaying() {
    return this.delaying;
  }

  get heldCount() {
    return this.held.length;
  }

  startDelay() {
    this.delaying = true;
  }

  hold() {
    return new Promise<void>((resolve) => this.held.push(resolve));
  }

  releaseAll() {
    this.delaying = false;
    this.held.splice(0).forEach((release) => release());
  }
}

async function setup(page: Page, url: string, suffix: string) {
  const login = await page.request.get(url + "/api/v1/auth/dev-login");
  expect(login.ok()).toBeTruthy();
  const existing = await page.request.get(url + LIST_PATH, {
    params: {
      from: "1970-01-01T00:00:00.000Z",
      to: "2100-01-01T00:00:00.000Z",
    },
  });
  expect(existing.ok()).toBeTruthy();
  for (const operation of TransactionsListResponse.parse(
    await existing.json(),
  )) {
    const deleted = await page.request.delete(
      url + LIST_PATH + "/" + operation.id,
    );
    expect(deleted.ok()).toBeTruthy();
  }
  const categoryResponse = await page.request.post(
    url + "/api/v1/accounts/1/categories",
    {
      data: { type: "expense", name: "Еда " + suffix },
    },
  );
  expect(categoryResponse.ok()).toBeTruthy();
  return CategoriesCreateResponse.parse(await categoryResponse.json());
}

for (const colorScheme of ["light", "dark"] as const) {
  for (const resource of ["transactions", "categories"] as const) {
    test(`second entry while ${resource} refetch is held: ${colorScheme}`, async ({
      page,
      backend,
    }, testInfo) => {
      test.setTimeout(60000);
      await page.emulateMedia({ colorScheme });
      const food = await setup(page, backend.url, `${colorScheme} ${resource}`);

      const delayedGet = new DelayedGet();
      await page.route("**/api/v1/**", async (route) => {
        const request = route.request();
        const original = new URL(request.url());
        if (
          request.method() === "GET" &&
          original.pathname === `/api/v1/accounts/1/${resource}` &&
          delayedGet.isDelaying
        ) {
          // Барьер ставится до fetch: после второй записи ответы содержат обе операции.
          await delayedGet.hold();
        }
        const response = await route.fetch({
          url: backend.url + original.pathname + original.search,
        });
        await route.fulfill({ response });
      });

      const initialHistory = page.waitForResponse(
        (response) =>
          response.request().method() === "GET" &&
          new URL(response.url()).pathname === LIST_PATH,
      );
      await page.goto("/");
      expect((await initialHistory).ok()).toBeTruthy();
      await (await initialHistory).finished();
      await expect(
        page.getByRole("button", { name: food.name, exact: true }),
      ).toBeVisible();
      delayedGet.startDelay();

      try {
        await page
          .getByPlaceholder("добавить комментарий")
          .fill("Первая операция");
        const first = await saveExpense(page, food.name, ["5", "0"]);
        expect(first.amount).toBe(50);
        expect(first.description).toBe("Первая операция");
        await expect.poll(() => delayedGet.heldCount).toBeGreaterThan(0);
        await expect(page.getByPlaceholder("добавить комментарий")).toHaveValue(
          "",
        );
        const second = await saveExpense(page, food.name, ["7"]);
        expect(second.amount).toBe(7);
        expect(second.description).toBeNull();
        expect(delayedGet.isDelaying).toBe(true);
        expect(delayedGet.heldCount).toBeGreaterThan(0);

        delayedGet.releaseAll();
        const foodRows = page.getByRole("button", {
          name: new RegExp(food.name),
        });
        await expect(foodRows.filter({ hasText: "-50 ₽" })).toBeVisible();
        await expect(foodRows.filter({ hasText: "-7 ₽" })).toBeVisible();
        await page.screenshot({
          path: testInfo.outputPath("independent-entry.png"),
        });
      } finally {
        delayedGet.releaseAll();
      }
    });
  }
}

async function saveExpense(page: Page, categoryName: string, digits: string[]) {
  for (const digit of digits) {
    await page.getByRole("button", { name: digit, exact: true }).click();
  }
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === LIST_PATH,
  );
  await page.getByRole("button", { name: categoryName, exact: true }).click();
  const response = await created;
  expect(response.ok()).toBeTruthy();
  return TransactionsGetResponse.parse(await response.json());
}
