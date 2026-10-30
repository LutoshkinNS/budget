import { expect, type Page } from "@playwright/test";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";

import { test } from "./support/backend-fixture";

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

async function assertLayout(page: Page, width: number) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
          document.getElementById("root")?.scrollWidth ?? 0,
        ),
      ),
    )
    .toBeLessThanOrEqual(width);
}

test("reports open real category operations and keep close usable during reads", async ({
  page,
  backend,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  expect(
    (await page.request.get(backend.url + "/api/v1/auth/dev-login")).ok(),
  ).toBeTruthy();
  const categoryResponse = await page.request.post(
    backend.url + "/api/v1/accounts/1/categories",
    {
      data: { name: "Сквозной отчёт", type: "expense", iconKey: null },
    },
  );
  expect(categoryResponse.ok()).toBeTruthy();
  const category = CategoriesCreateResponse.parse(
    await categoryResponse.json(),
  );
  expect(
    (
      await page.request.post(backend.url + "/api/v1/accounts/1/transactions", {
        data: {
          amount: 123,
          categoryId: category.id,
          type: "expense",
          description: "Сквозная операция отчёта",
          date: "2026-10-05T09:00:00.000Z",
        },
      })
    ).ok(),
  ).toBeTruthy();

  const summary = new ResponseBarrier();
  const operations = new ResponseBarrier();
  const operationsRequests: URL[] = [];
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: backend.url + url.pathname + url.search,
    });
    if (url.pathname.endsWith("/transactions/category-summary"))
      await summary.wait();
    if (
      url.pathname.endsWith("/transactions") &&
      route.request().method() === "GET"
    ) {
      operationsRequests.push(url);
      await operations.wait();
    }
    await route.fulfill({ response });
  });

  try {
    await page.goto(
      "/reports?period=range&fromDate=2026-10-01&toDate=2026-10-20&month=2026-10",
    );
    await expect.poll(() => summary.heldCount).toBeGreaterThan(0);
    const reportSkeleton = page.getByRole("status", {
      name: "Загрузка отчёта",
      exact: true,
    });
    await expect(reportSkeleton).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Отчёты", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Доходы", exact: true }),
    ).toBeEnabled();
    await expect(page.getByLabel("От", { exact: true })).toBeEnabled();
    const decoration = reportSkeleton.locator('[aria-hidden="true"]').first();
    expect(
      await decoration.evaluate(
        (element) => getComputedStyle(element).animationName,
      ),
    ).toBe("none");
    expect(
      await reportSkeleton.locator("button, input, [tabindex]").count(),
    ).toBe(0);
    await assertLayout(page, 390);
    await page.screenshot({
      path: testInfo.outputPath("reports-initial-light-mobile.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await assertLayout(page, 1280);
    await page.screenshot({
      path: testInfo.outputPath("reports-initial-dark-desktop.png"),
      fullPage: true,
    });
    summary.release();
    await page
      .getByRole("button", {
        name: "Открыть операции категории Сквозной отчёт",
      })
      .click();
    await expect.poll(() => operations.heldCount).toBeGreaterThan(0);
    const sheet = page.getByRole("dialog", {
      name: "Сквозной отчёт",
      exact: true,
    });
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole("status", { name: "Загрузка операций", exact: true }),
    ).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: "Закрыть", exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("region", { name: "Сводка: Расходы" }),
    ).toBeVisible();
    expect(operationsRequests).toHaveLength(1);
    expect(operationsRequests[0]?.searchParams.get("categoryId")).toBe(
      String(category.id),
    );
    expect(operationsRequests[0]?.searchParams.get("type")).toBe("expense");
    await page.screenshot({
      path: testInfo.outputPath("reports-operations-dark-desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await assertLayout(page, 390);
    await page.screenshot({
      path: testInfo.outputPath("reports-operations-light-mobile.png"),
      fullPage: true,
    });
    operations.release();
    await expect(sheet.getByText("Сквозная операция отчёта")).toBeVisible();
    await sheet.getByRole("button", { name: "Закрыть", exact: true }).click();
    await expect(sheet).toBeHidden();
    await expect(page).not.toHaveURL(/selectedCategoryId=/);

    await page
      .getByRole("button", {
        name: "Открыть операции категории Сквозной отчёт",
      })
      .click();
    await expect(sheet.getByText("Сквозная операция отчёта")).toBeVisible();
    await expect(
      sheet.getByRole("status", { name: "Загрузка операций", exact: true }),
    ).toBeHidden();
    expect(operationsRequests).toHaveLength(1);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  } finally {
    summary.release();
    operations.release();
  }
});
