import { expect, type Page } from "@playwright/test";

import {
  CategoriesCreateResponse,
  CategoriesListResponse,
} from "../src/common/api/generate/categories/categories.zod.gen";
import { TransactionsGetResponse } from "../src/common/api/generate/transactions/transactions.zod.gen";

import { test } from "./support/category-usage-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  timezoneId: "Europe/Moscow",
});

type CategoryType = "income" | "expense";

async function setup(page: Page, backendUrl: string, type: CategoryType) {
  await page.route("**/api/v1/**", async (route) => {
    const original = new URL(route.request().url());
    const response = await route.fetch({
      url: backendUrl + original.pathname + original.search,
    });
    await route.fulfill({ response });
  });
  const login = await page.request.get(backendUrl + "/api/v1/auth/dev-login");
  expect(login.ok()).toBeTruthy();

  const suffix = `${type}-${Date.now()}`;
  async function createCategory(name: string) {
    const response = await page.request.post(
      backendUrl + "/api/v1/categories",
      { data: { type, name: `${name} ${suffix}` } },
    );
    expect(response.ok()).toBeTruthy();
    return CategoriesCreateResponse.parse(await response.json());
  }
  const alpha = await createCategory("Альфа");
  const beta = await createCategory("Бета");
  const gamma = await createCategory("Гамма");
  const delta = await createCategory("Дельта");

  async function createOperation(categoryId: number, description: string) {
    const response = await page.request.post(
      backendUrl + "/api/v1/transactions",
      {
        data: {
          type,
          categoryId,
          amount: 100,
          date: new Date().toISOString(),
          description,
        },
      },
    );
    expect(response.ok()).toBeTruthy();
    return TransactionsGetResponse.parse(await response.json());
  }
  await createOperation(alpha.id, `Начальная операция ${suffix}`);
  const deletionDescription = `Операция Бета 1 ${suffix}`;
  await createOperation(beta.id, deletionDescription);
  await createOperation(beta.id, `Операция Бета 2 ${suffix}`);

  async function readUsageOrder() {
    const response = await page.request.get(backendUrl + "/api/v1/categories", {
      params: { type, sort: "usage" },
    });
    expect(response.ok()).toBeTruthy();
    return CategoriesListResponse.parse(await response.json());
  }

  return {
    alpha,
    beta,
    gamma,
    delta,
    readUsageOrder,
    createCategory,
    createOperation,
    deletionDescription,
    suffix,
  };
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    ),
  ).toBeLessThanOrEqual(390);
}

async function readKeyboardButtonNames(page: Page) {
  return page
    .locator("button[aria-pressed]")
    .evaluateAll((buttons) =>
      buttons.slice(2).map((button) => button.textContent?.trim() ?? ""),
    );
}

for (const colorScheme of ["light", "dark"] as const) {
  for (const type of ["expense", "income"] as const) {
    test(`orders ${type} categories by usage in ${colorScheme} theme`, async ({
      page,
      backend,
    }, testInfo) => {
      test.setTimeout(60000);
      await page.emulateMedia({ colorScheme });
      const {
        alpha,
        beta,
        gamma,
        delta,
        readUsageOrder,
        deletionDescription,
        suffix,
      } = await setup(page, backend.url, type);
      expect((await readUsageOrder()).map((category) => category.id)).toEqual([
        beta.id,
        alpha.id,
        gamma.id,
        delta.id,
      ]);

      await page.goto("/");
      if (type === "income") {
        await page.getByRole("button", { name: "доход", exact: true }).click();
      }
      await expect
        .poll(() => readKeyboardButtonNames(page))
        .toEqual([
          `${beta.name}`,
          `${gamma.name}`,
          `${alpha.name}`,
          `${delta.name}`,
        ]);
      const first = await page
        .getByRole("button", { name: beta.name, exact: true })
        .boundingBox();
      const second = await page
        .getByRole("button", { name: alpha.name, exact: true })
        .boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeLessThan(1);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath("home-before-create.png"),
        fullPage: true,
      });

      for (const digit of ["1", "0", "0"]) {
        await page.getByRole("button", { name: digit, exact: true }).click();
      }
      const created = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).pathname === "/api/v1/transactions",
      );
      await page.getByRole("button", { name: alpha.name, exact: true }).click();
      expect((await created).ok()).toBeTruthy();
      await expect
        .poll(() => readKeyboardButtonNames(page))
        .toEqual([
          `${alpha.name}`,
          `${gamma.name}`,
          `${beta.name}`,
          `${delta.name}`,
        ]);

      await page
        .getByRole("button", { name: new RegExp(alpha.name + ".*" + suffix) })
        .click();
      await expect(
        page.getByRole("heading", {
          name: `Редактировать ${type === "income" ? "доход" : "расход"}`,
        }),
      ).toBeVisible();
      const categorySelect = page.getByRole("combobox", { name: "Категория" });
      await expect(categorySelect.locator("option")).toHaveText([
        alpha.name,
        beta.name,
        gamma.name,
        delta.name,
      ]);
      await categorySelect.selectOption(String(gamma.id));
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath("editor-before-update.png"),
        fullPage: true,
      });
      const updated = page.waitForResponse(
        (response) =>
          response.request().method() === "PATCH" &&
          new URL(response.url()).pathname.startsWith("/api/v1/transactions/"),
      );
      await page
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      expect((await updated).ok()).toBeTruthy();
      await expect(categorySelect).toHaveValue(String(gamma.id));
      await expect(categorySelect.locator("option")).toHaveText([
        beta.name,
        alpha.name,
        gamma.name,
        delta.name,
      ]);
      await page.screenshot({
        path: testInfo.outputPath("editor-after-update.png"),
        fullPage: true,
      });

      await page.goto("/");
      if (type === "income") {
        await page.getByRole("button", { name: "доход", exact: true }).click();
      }
      await expect
        .poll(() => readKeyboardButtonNames(page))
        .toEqual([beta.name, gamma.name, alpha.name, delta.name]);
      page.once("dialog", (dialog) => dialog.accept());
      const deleted = page.waitForResponse(
        (response) =>
          response.request().method() === "DELETE" &&
          new URL(response.url()).pathname.startsWith("/api/v1/transactions/"),
      );
      await page
        .getByRole("button", {
          name: new RegExp(beta.name + ".*" + deletionDescription),
        })
        .locator("..")
        .getByRole("button", {
          name: "Удалить " + (type === "income" ? "доход" : "расход"),
        })
        .click();
      expect((await deleted).ok()).toBeTruthy();
      await expect
        .poll(() => readKeyboardButtonNames(page))
        .toEqual([
          `${alpha.name}`,
          `${gamma.name}`,
          `${beta.name}`,
          `${delta.name}`,
        ]);
      expect((await readUsageOrder()).map((category) => category.id)).toEqual([
        alpha.id,
        beta.id,
        gamma.id,
        delta.id,
      ]);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath("home-after-delete.png"),
        fullPage: true,
      });
    });
  }

  test(`refreshes cached category order when switching accounts in ${colorScheme} theme`, async ({
    page,
    backend,
  }, testInfo) => {
    test.setTimeout(60000);
    await page.emulateMedia({ colorScheme });
    const { alpha, beta, gamma, delta, createCategory, createOperation } =
      await setup(page, backend.url, "expense");

    async function switchThroughApi(accountId: number) {
      const response = await page.request.post(
        backend.url + "/api/v1/auth/switch-account",
        { data: { accountId } },
      );
      expect(response.ok()).toBeTruthy();
    }

    await switchThroughApi(backend.secondaryAccountId);
    const secondaryRare = await createCategory("Другой редкий расход");
    const secondaryFrequent = await createCategory("Другой частый расход");
    await createOperation(secondaryRare.id, "Редкий расход другого счёта");
    await createOperation(
      secondaryFrequent.id,
      "Частый расход другого счёта 1",
    );
    await createOperation(
      secondaryFrequent.id,
      "Частый расход другого счёта 2",
    );
    await switchThroughApi(backend.primaryAccountId);

    await page.goto("/");
    await expect
      .poll(() => readKeyboardButtonNames(page))
      .toEqual([beta.name, gamma.name, alpha.name, delta.name]);

    async function switchThroughUi(accountId: number) {
      await page.getByRole("link", { name: "Настройки", exact: true }).click();
      const accountSelect = page
        .getByRole("group", { name: "Текущий аккаунт" })
        .getByRole("combobox");
      await expect(accountSelect).toBeEnabled();
      await accountSelect.selectOption(String(accountId));
      await expect(accountSelect).toHaveValue(String(accountId));
      await expect(accountSelect).toBeEnabled();
      await page.getByRole("link", { name: "Расходы", exact: true }).click();
    }

    await switchThroughUi(backend.secondaryAccountId);
    await expect
      .poll(() => readKeyboardButtonNames(page))
      .toEqual([secondaryFrequent.name, secondaryRare.name]);
    await switchThroughUi(backend.primaryAccountId);
    await expect
      .poll(() => readKeyboardButtonNames(page))
      .toEqual([beta.name, gamma.name, alpha.name, delta.name]);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath("home-after-account-switch.png"),
      fullPage: true,
    });
  });
}
