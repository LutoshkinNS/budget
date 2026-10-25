import { expect, type Page } from "@playwright/test";

import { test } from "./support/category-icons-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

async function assertMobileLayout(page: Page) {
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
    .toBeLessThanOrEqual(390);
}

async function category(page: Page, apiUrl: string, id: number) {
  const response = await page.request.get(apiUrl + "/api/v1/accounts/1/categories/" + id);
  expect(response.ok()).toBeTruthy();
  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || !("iconKey" in data))
    throw new Error("Invalid Category response");
  return data;
}

for (const colorScheme of ["light", "dark"] as const) {
  test(
    "category icon lifecycle on mobile in " + colorScheme,
    async ({ page, categoryBackend }, testInfo) => {
      test.setTimeout(60000);
      await page.emulateMedia({ colorScheme });
      // Проксируем HTTP в настоящий изолированный backend, не подменяя данные API.
      await page.route("**/api/v1/**", async (route) => {
        const original = new URL(route.request().url());
        const response = await route.fetch({
          url: categoryBackend.url + original.pathname + original.search,
        });
        await route.fulfill({ response });
      });
      const login = await page.request.get(
        categoryBackend.url + "/api/v1/auth/dev-login",
      );
      expect(login.ok()).toBeTruthy();
      await page.goto("/categories");
      expect(
        (await category(page, categoryBackend.url, categoryBackend.legacyId))
          .iconKey,
      ).toBeNull();

      const name = "продукты " + colorScheme;
      const create = page.getByRole("group", {
        name: "Создание новой категории",
        exact: true,
      });
      await create.getByLabel("Наименование категории").fill(name);
      await expect(
        create.getByRole("button", { name: "Без иконки" }),
      ).toHaveAttribute("aria-pressed", "true");
      const created = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).pathname === "/api/v1/accounts/1/categories",
      );
      await create
        .getByRole("button", { name: "Создать", exact: true })
        .click();
      const createdResponse = await created;
      expect(createdResponse.ok()).toBeTruthy();
      const createdData: unknown = await createdResponse.json();
      if (
        typeof createdData !== "object" ||
        createdData === null ||
        !("id" in createdData) ||
        typeof createdData.id !== "number"
      ) {
        throw new Error("Missing created category ID");
      }
      const id = createdData.id;
      expect(
        (await category(page, categoryBackend.url, id)).iconKey,
      ).toBeNull();
      await page.reload();
      const editButton = page.getByRole("button", {
        name: "Изменить категорию " + name,
        exact: true,
      });
      await expect(editButton.locator("img")).toHaveCount(0);
      await editButton.click();
      const editor = page.getByRole("group", {
        name: "Редактирование категории " + name,
        exact: true,
      });
      await editor
        .getByRole("button", { name: "Продукты", exact: true })
        .click();
      await editor.getByRole("button", { name: "Отмена", exact: true }).click();
      expect(
        (await category(page, categoryBackend.url, id)).iconKey,
      ).toBeNull();
      await editButton.click();
      await editor
        .getByRole("button", { name: "Продукты", exact: true })
        .click();
      const patched = page.waitForResponse(
        (response) =>
          response.request().method() === "PATCH" &&
          response.url().includes("/categories/" + id),
      );
      await editor
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      expect((await patched).ok()).toBeTruthy();
      await expect(editButton.locator("img")).toHaveAttribute(
        "src",
        /groceries\.png/,
      );
      expect((await category(page, categoryBackend.url, id)).iconKey).toBe(
        "groceries",
      );
      await page.reload();
      await expect(editButton.locator("img")).toHaveAttribute(
        "src",
        /groceries\.png/,
      );

      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      const keyboardCategory = page.getByRole("button", { name, exact: true });
      await expect(keyboardCategory.locator("img")).toHaveAttribute(
        "src",
        /groceries\.png/,
      );
      const createdTransaction = await page.request.post(
        categoryBackend.url + "/api/v1/accounts/1/transactions",
        {
          data: {
            categoryId: id,
            type: "expense",
            amount: 123,
            date: new Date().toISOString(),
            description: "Проверка иконки",
          },
        },
      );
      expect(createdTransaction.ok()).toBeTruthy();
      await page.reload();
      const operation = page.getByRole("button", {
        name: new RegExp(name + ".*Проверка иконки"),
      });
      await expect(operation.locator("img")).toHaveAttribute(
        "src",
        /groceries\.png/,
      );
      const geometry = await keyboardCategory.evaluate((element) => {
        const style = getComputedStyle(element);
        const image = element.querySelector("img");
        return {
          height: element.getBoundingClientRect().height,
          radius: style.borderRadius,
          gap: style.gap,
          imageWidth: image?.getBoundingClientRect().width,
          imageHeight: image?.getBoundingClientRect().height,
          loaded: Boolean(image?.complete && image.naturalWidth > 0),
        };
      });
      expect(geometry).toEqual({
        height: 40,
        radius: "12px",
        gap: "6px",
        imageWidth: 24,
        imageHeight: 24,
        loaded: true,
      });
      await assertMobileLayout(page);
      await page.screenshot({
        path: testInfo.outputPath("expenses-" + colorScheme + ".png"),
        fullPage: true,
      });

      await page.getByRole("link", { name: "Категории", exact: true }).click();
      await editButton.click();
      await editor.getByRole("button", { name: "Такси", exact: true }).click();
      await editor
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      await expect(editButton.locator("img")).toHaveAttribute(
        "src",
        /taxi\.png/,
      );
      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      await expect(operation.locator("img")).toHaveAttribute(
        "src",
        /taxi\.png/,
      );
      await expect(keyboardCategory.locator("img")).toHaveAttribute(
        "src",
        /taxi\.png/,
      );

      await page.getByRole("link", { name: "Категории", exact: true }).click();
      await editButton.click();
      await editor
        .getByRole("button", { name: "Без иконки", exact: true })
        .click();
      await editor
        .getByRole("button", { name: "Сохранить", exact: true })
        .click();
      await expect(editButton.locator("img")).toHaveCount(0);
      expect(
        (await category(page, categoryBackend.url, id)).iconKey,
      ).toBeNull();
      await page.reload();
      await expect(editButton.locator("img")).toHaveCount(0);
      await page.getByRole("link", { name: "Расходы", exact: true }).click();
      await expect(operation.locator("img")).toHaveCount(0);
      await expect(keyboardCategory.locator("img")).toHaveCount(0);

      await page.getByRole("link", { name: "Категории", exact: true }).click();
      const withIconName =
        "Длинное пользовательское название категории для проверки мобильной формы " +
        colorScheme;
      await create.getByLabel("Наименование категории").fill(withIconName);
      await create
        .getByRole("button", { name: "Продукты", exact: true })
        .click();
      await expect(
        create.getByRole("button", { name: "Продукты", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(create.locator("img")).toHaveCount(20);
      await expect
        .poll(() =>
          create
            .locator("img")
            .evaluateAll((images) =>
              images.every(
                (image) =>
                  image instanceof HTMLImageElement &&
                  image.complete &&
                  image.naturalWidth > 0,
              ),
            ),
        )
        .toBe(true);
      await create.getByLabel("Наименование категории").focus();
      await page.keyboard.press("Tab");
      await expect(
        create.getByRole("button", { name: "Без иконки" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      const focusedIcon = create.getByRole("button", {
        name: "Продукты",
        exact: true,
      });
      await expect(focusedIcon).toBeFocused();
      expect(
        await focusedIcon.evaluate(
          (button) => getComputedStyle(button).outlineStyle,
        ),
      ).not.toBe("none");
      await assertMobileLayout(page);
      await page.screenshot({
        path: testInfo.outputPath("picker-" + colorScheme + ".png"),
        fullPage: true,
      });
      await create
        .getByRole("button", { name: "Создать", exact: true })
        .click();
      await expect(
        page
          .getByRole("button", {
            name: "Изменить категорию " + withIconName,
            exact: true,
          })
          .locator("img"),
      ).toHaveAttribute("src", /groceries\.png/);
      await expect(
        create.getByRole("button", { name: "Без иконки" }),
      ).toHaveAttribute("aria-pressed", "true");
      await assertMobileLayout(page);
    },
  );
}
