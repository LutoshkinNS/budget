import { expect } from "@playwright/test";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";
import { TransactionsGetResponse } from "../src/common/api/generate/transactions/transactions.zod.gen";

import { test } from "./support/backend-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  timezoneId: "Europe/Moscow",
});

for (const colorScheme of ["light", "dark"] as const) {
  for (const type of ["expense", "income"] as const) {
    test(`rename ${type} category in ${colorScheme}`, async ({
      page,
      backend,
    }, testInfo) => {
      await page.emulateMedia({ colorScheme });
      await page.route("**/api/v1/**", async (route) => {
        const original = new URL(route.request().url());
        const response = await route.fetch({
          url: backend.url + original.pathname + original.search,
        });
        await route.fulfill({ response });
      });
      expect(
        (await page.request.get(backend.url + "/api/v1/auth/dev-login")).ok(),
      ).toBeTruthy();
      const name = `До переименования ${type} ${colorScheme}`;
      const renamed = `После переименования ${type} ${colorScheme}`;
      const occupied = `Занято ${type} ${colorScheme}`;
      const response = await page.request.post(
        backend.url + "/api/v1/accounts/1/categories",
        {
          data: { name, type, iconKey: "groceries" },
        },
      );
      expect(response.ok()).toBeTruthy();
      const category = CategoriesCreateResponse.parse(await response.json());
      expect(
        (
          await page.request.post(backend.url + "/api/v1/accounts/1/categories", {
            data: { name: occupied, type },
          })
        ).ok(),
      ).toBeTruthy();
      const created = await page.request.post(
        backend.url + "/api/v1/accounts/1/transactions",
        {
          data: {
            categoryId: category.id,
            type,
            amount: 123,
            date: new Date().toISOString(),
            description: name,
          },
        },
      );
      expect(created.ok()).toBeTruthy();
      const transaction = TransactionsGetResponse.parse(await created.json());

      // Сначала загружаем отчёт, чтобы проверить обновление уже закэшированного имени.
      await page.goto(`/reports?type=${type}`);
      await expect(
        page.getByRole("button", {
          name: "Открыть операции категории " + name,
          exact: true,
        }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Категории", exact: true }).click();
      if (type === "income")
        await page.getByRole("button", { name: "доходы", exact: true }).click();
      const edit = page.getByRole("button", {
        name: "Изменить категорию " + name,
        exact: true,
      });
      await edit.click();
      const editor = page.getByRole("group", {
        name: "Редактирование категории " + name,
        exact: true,
      });
      const input = editor.getByLabel("Наименование категории");
      await input.fill("Отменённый черновик");
      await editor.getByRole("button", { name: "Отмена", exact: true }).click();
      await edit.click();
      await expect(input).toHaveValue(name);
      await input.fill("   ");
      await editor
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      await expect(
        editor.getByText("Наименование категории обязательно"),
      ).toBeVisible();
      await input.fill(occupied.toUpperCase());
      await editor
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      await expect(
        editor.getByText("Категория с таким названием уже существует"),
      ).toBeVisible();
      await input.fill("  " + renamed + "  ");
      await page.screenshot({
        path: testInfo.outputPath("editor.png"),
        fullPage: true,
      });
      await editor
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      await expect(
        page.getByRole("button", {
          name: "Изменить категорию " + renamed,
          exact: true,
        }),
      ).toBeVisible();
      const storedResponse = await page.request.get(
        backend.url + "/api/v1/accounts/1/categories/" + category.id,
      );
      expect(storedResponse.ok()).toBeTruthy();
      expect(
        CategoriesCreateResponse.parse(await storedResponse.json()),
      ).toEqual({ ...category, name: renamed });
      const operationResponse = await page.request.get(
        backend.url + "/api/v1/accounts/1/transactions/" + transaction.id,
      );
      expect(operationResponse.ok()).toBeTruthy();
      expect(
        TransactionsGetResponse.parse(await operationResponse.json()),
      ).toEqual(transaction);

      await page.getByRole("link", { name: "Отчёты", exact: true }).click();
      if (type === "income")
        await page.getByRole("tab", { name: "Доходы", exact: true }).click();
      await expect(
        page.getByRole("button", {
          name: "Открыть операции категории " + renamed,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Открыть операции категории " + name,
          exact: true,
        }),
      ).toHaveCount(0);
      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      const operation = page.getByRole("button", {
        name: new RegExp(renamed + ".*" + name),
      });
      await expect(operation).toBeVisible();
      await expect(operation.locator("img")).toHaveAttribute(
        "src",
        /groceries\.png/,
      );
      await page.reload();
      await expect(operation).toBeVisible();
      expect(
        await page.evaluate(() =>
          Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth,
          ),
        ),
      ).toBeLessThanOrEqual(390);
      await page.screenshot({
        path: testInfo.outputPath("renamed-history.png"),
        fullPage: true,
      });
    });
  }
}
