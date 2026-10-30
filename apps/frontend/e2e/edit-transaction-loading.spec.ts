import { expect } from "@playwright/test";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";
import { TransactionsGetResponse } from "../src/common/api/generate/transactions/transactions.zod.gen";

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

test("edit saves once and redirects before background reads finish", async ({
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
      data: { type: "expense", name: "Редактируемая категория", iconKey: null },
    },
  );
  expect(categoryResponse.ok()).toBeTruthy();
  const category = CategoriesCreateResponse.parse(
    await categoryResponse.json(),
  );
  const created = await page.request.post(
    backend.url + "/api/v1/accounts/1/transactions",
    {
      data: {
        type: "expense",
        amount: 25,
        categoryId: category.id,
        date: "2026-10-15T09:18:27.000Z",
        description: "Исходное значение",
      },
    },
  );
  expect(created.ok()).toBeTruthy();
  const transaction = TransactionsGetResponse.parse(await created.json());
  const detail = new ResponseBarrier();
  const categories = new ResponseBarrier();
  const patch = new ResponseBarrier();
  const refresh = new ResponseBarrier();
  let patchCount = 0;
  let afterPatch = false;
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const response = await route.fetch({
      url: backend.url + url.pathname + url.search,
    });
    if (method === "PATCH") {
      patchCount += 1;
      await patch.wait();
      afterPatch = true;
    } else if (method === "GET" && url.pathname.includes("/accounts/")) {
      if (afterPatch) await refresh.wait();
      else if (url.pathname.endsWith(`/transactions/${transaction.id}`))
        await detail.wait();
      else if (url.pathname.endsWith("/categories")) await categories.wait();
    }
    await route.fulfill({ response });
  });

  try {
    await page.goto(`/expenses/${transaction.id}/edit`);
    await expect.poll(() => detail.heldCount).toBeGreaterThan(0);
    const detailStatus = page.getByRole("status", {
      name: "Загрузка операции",
    });
    await expect(detailStatus).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Редактировать операцию" }),
    ).toBeVisible();
    expect(await detailStatus.locator('[aria-hidden="true"]').count()).toBe(5);
    expect(
      await detailStatus.locator("button,input,select,[tabindex]").count(),
    ).toBe(0);
    expect(
      await detailStatus
        .locator('[aria-hidden="true"]')
        .first()
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe("none");
    await page.screenshot({
      path: testInfo.outputPath("edit-initial-light-mobile.png"),
      fullPage: true,
    });
    detail.release();
    await expect.poll(() => categories.heldCount).toBeGreaterThan(0);
    await expect(page.getByLabel("Сумма", { exact: true })).toBeEnabled();
    await expect(page.getByLabel("Комментарий", { exact: true })).toHaveValue(
      "Исходное значение",
    );
    await expect(detailStatus).toHaveCount(0);
    await page
      .getByLabel("Комментарий", { exact: true })
      .fill("Сохранённый черновик");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.screenshot({
      path: testInfo.outputPath("edit-categories-pending-dark-desktop.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await expect.poll(() => patch.heldCount).toBe(1);
    expect(patchCount).toBe(1);
    await expect(
      page.getByRole("button", { name: "Сохранение...", exact: true }),
    ).toBeDisabled();
    await expect(page.getByLabel("Сумма", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("Комментарий", { exact: true })).toHaveValue(
      "Сохранённый черновик",
    );
    await page.screenshot({
      path: testInfo.outputPath("edit-saving-dark-desktop.png"),
      fullPage: true,
    });
    patch.release();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => refresh.heldCount).toBeGreaterThan(0);
    expect(categories.heldCount).toBeGreaterThan(0);
    expect(patchCount).toBe(1);
    const persisted = await page.request.get(
      backend.url + `/api/v1/accounts/1/transactions/${transaction.id}`,
    );
    expect(persisted.ok()).toBeTruthy();
    expect(TransactionsGetResponse.parse(await persisted.json())).toMatchObject(
      {
        description: "Сохранённый черновик",
        categoryId: category.id,
        amount: 25,
        type: "expense",
        date: transaction.date,
      },
    );
  } finally {
    detail.release();
    categories.release();
    patch.release();
    refresh.release();
  }
});
