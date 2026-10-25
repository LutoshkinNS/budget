import { expect, type Page } from "@playwright/test";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";
import type { TransactionCreateDTO } from "../src/common/api/generate/model";
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

async function setup(page: Page, url: string, suffix: string) {
  await page.route("**/api/v1/**", async (route) => {
    const original = new URL(route.request().url());
    const response = await route.fetch({
      url: url + original.pathname + original.search,
    });
    await route.fulfill({ response });
  });
  const login = await page.request.get(url + "/api/v1/auth/dev-login");
  expect(login.ok()).toBeTruthy();
  const existing = await page.request.get(url + "/api/v1/accounts/1/transactions", {
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
      url + "/api/v1/accounts/1/transactions/" + operation.id,
    );
    expect(deleted.ok()).toBeTruthy();
  }
  async function category(type: "income" | "expense", name: string) {
    const response = await page.request.post(url + "/api/v1/accounts/1/categories", {
      data: { type, name: name + " " + suffix },
    });
    expect(response.ok()).toBeTruthy();
    return CategoriesCreateResponse.parse(await response.json());
  }
  return {
    salary: await category("income", "Зарплата"),
    bonus: await category("income", "Премия"),
    food: await category("expense", "Еда"),
  };
}

async function createOperation(
  page: Page,
  url: string,
  data: TransactionCreateDTO,
) {
  const response = await page.request.post(url + "/api/v1/accounts/1/transactions", {
    data,
  });
  expect(response.ok()).toBeTruthy();
  return TransactionsGetResponse.parse(await response.json());
}

async function assertMobileLayout(page: Page) {
  expect(
    await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    ),
  ).toBeLessThanOrEqual(390);
}

for (const colorScheme of ["light", "dark"] as const) {
  test(
    "create and edit income in shared history: " + colorScheme,
    async ({ page, backend }, testInfo) => {
      test.setTimeout(60000);
      await page.emulateMedia({ colorScheme });
      const { salary, bonus, food } = await setup(
        page,
        backend.url,
        colorScheme,
      );
      await page.goto("/");
      await expect(page.getByText("Нет операций за период")).toBeVisible();

      await page.getByRole("button", { name: "доход", exact: true }).click();
      for (const digit of ["1", "0", "0", "0"]) {
        await page.getByRole("button", { name: digit, exact: true }).click();
      }
      await page
        .getByPlaceholder("добавить комментарий")
        .fill("Доход " + colorScheme);
      const created = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).pathname === "/api/v1/accounts/1/transactions",
      );
      await page
        .getByRole("button", { name: salary.name, exact: true })
        .click();
      const response = await created;
      expect(response.ok()).toBeTruthy();
      const income = TransactionsGetResponse.parse(await response.json());
      const operation = page.getByRole("button", {
        name: new RegExp(salary.name + ".*Доход"),
      });
      await expect(operation).toContainText("+1 000 ₽");
      await page.reload();
      await expect(operation).toBeEnabled();

      const expense = await createOperation(page, backend.url, {
        type: "expense",
        categoryId: food.id,
        amount: 300,
        date: new Date().toISOString(),
        description: "Расход " + colorScheme,
      });
      await page.reload();
      const expenseRow = page.getByRole("button", {
        name: new RegExp(food.name + ".*Расход"),
      });
      await expect(expenseRow).toContainText("-300 ₽");
      await expect(page.getByText("+700 ₽", { exact: true })).toBeVisible();
      await assertMobileLayout(page);
      await page.screenshot({
        path: testInfo.outputPath("history.png"),
        fullPage: true,
      });

      // Прогреваем сводку и отчёты до изменения, чтобы проверить инвалидацию кеша.
      await page.getByRole("link", { name: "Дашборд", exact: true }).click();
      await expect(
        page.getByText("Текущий баланс").locator(".."),
      ).toContainText("700 ₽");
      await page.getByRole("link", { name: "Отчёты", exact: true }).click();
      await page.getByRole("tab", { name: "Доходы", exact: true }).click();
      await page.getByRole("tab", { name: "Неделя", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "Сводка: Доходы" }),
      ).toContainText("1 000 ₽");
      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      await operation.click();
      await expect(
        page.getByRole("heading", { name: "Редактировать доход" }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Категория").locator("option"),
      ).toContainText([salary.name, bonus.name]);
      await page.getByLabel("Сумма", { exact: true }).fill("1500.50");
      await page
        .getByLabel("Комментарий", { exact: true })
        .fill("Изменённый доход");
      await page
        .getByRole("combobox", { name: "Категория" })
        .selectOption(String(bonus.id));
      const originalDate = await page
        .getByLabel("Дата", { exact: true })
        .inputValue();
      const yesterday = new Date(originalDate + "T12:00:00+03:00");
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const editedDate = yesterday.toISOString().slice(0, 10);
      await page.getByLabel("Дата", { exact: true }).fill(editedDate);
      await assertMobileLayout(page);
      await page.screenshot({
        path: testInfo.outputPath("editor.png"),
        fullPage: true,
      });
      const saved = page.waitForResponse(
        (response) =>
          response.request().method() === "PATCH" &&
          new URL(response.url()).pathname ===
            "/api/v1/accounts/1/transactions/" + income.id,
      );
      await page
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      expect((await saved).ok()).toBeTruthy();
      await expect(page.getByText("Операция сохранена")).toBeVisible();
      const persisted = await page.request.get(
        backend.url + "/api/v1/accounts/1/transactions/" + income.id,
      );
      expect(
        TransactionsGetResponse.parse(await persisted.json()),
      ).toMatchObject({
        type: "income",
        amount: 1500.5,
        categoryId: bonus.id,
        description: "Изменённый доход",
      });

      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      await expect(
        page.getByRole("button", { name: /Изменённый доход/ }),
      ).toHaveCount(0);
      await expect(expenseRow).toBeVisible();
      await page.getByRole("link", { name: "Дашборд", exact: true }).click();
      await expect(
        page.getByText("Текущий баланс").locator(".."),
      ).toContainText("1 200,5 ₽");
      const editedOperation = page.getByRole("button", {
        name: /Изменённый доход/,
      });
      // Недельный диапазон включает вчера даже в первый день месяца.
      await page.getByRole("tab", { name: "неделя", exact: true }).click();
      await expect(editedOperation).toContainText("+1 500,5 ₽");
      await editedOperation.click();
      await expect(
        page.getByRole("heading", { name: "Редактировать доход" }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Отчёты", exact: true }).click();
      await page.getByRole("tab", { name: "Доходы", exact: true }).click();
      await page.getByRole("tab", { name: "Неделя", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "Сводка: Доходы" }),
      ).toContainText("1 500,5 ₽");
      await expect(
        page.getByRole("button", {
          name: "Открыть операции категории " + bonus.name,
        }),
      ).toBeVisible();

      await page.goto("/expenses/" + income.id + "/edit");
      await expect(page.getByLabel("Сумма", { exact: true })).toHaveValue(
        "1500.5",
      );
      await expect(page.getByLabel("Дата", { exact: true })).toHaveValue(
        editedDate,
      );
      await expect(page.getByLabel("Комментарий", { exact: true })).toHaveValue(
        "Изменённый доход",
      );
      await expect(
        page.getByRole("combobox", { name: "Категория" }),
      ).toHaveValue(String(bonus.id));

      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      await expenseRow.click();
      await expect(
        page.getByRole("heading", { name: "Редактировать расход" }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Категория").locator("option"),
      ).not.toContainText([bonus.name]);
      await page.getByLabel("Сумма", { exact: true }).fill("400");
      const expenseSaved = page.waitForResponse(
        (response) =>
          response.request().method() === "PATCH" &&
          new URL(response.url()).pathname ===
            "/api/v1/accounts/1/transactions/" + expense.id,
      );
      await page
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      expect(
        TransactionsGetResponse.parse(await (await expenseSaved).json()),
      ).toMatchObject({ type: "expense", amount: 400 });
      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      await expect(expenseRow).toContainText("-400 ₽");
    },
  );
}

test("existing income can be opened directly for editing", async ({
  page,
  backend,
}) => {
  const { salary } = await setup(page, backend.url, "direct");
  const income = await createOperation(page, backend.url, {
    type: "income",
    categoryId: salary.id,
    amount: 500,
    date: new Date().toISOString(),
  });
  await page.goto("/expenses/" + income.id + "/edit");
  await expect(
    page.getByRole("heading", { name: "Редактировать доход" }),
  ).toBeVisible();
});
