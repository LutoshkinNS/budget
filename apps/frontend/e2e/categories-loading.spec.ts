import { expect, type Page } from "@playwright/test";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";

import { test } from "./support/backend-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  timezoneId: "Europe/Moscow",
});

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

async function createCategory(page: Page, backendUrl: string, name: string) {
  const response = await page.request.post(
    backendUrl + "/api/v1/accounts/1/categories",
    { data: { name, type: "expense", iconKey: null } },
  );
  expect(response.ok()).toBeTruthy();
  return CategoriesCreateResponse.parse(await response.json());
}

async function installApi(page: Page, backendUrl: string) {
  expect(
    (await page.request.get(backendUrl + "/api/v1/auth/dev-login")).ok(),
  ).toBeTruthy();
  let readBarrier: ResponseBarrier | undefined;
  let writeBarrier: ResponseBarrier | undefined;
  let failure: "server" | "schema" | undefined;
  const calls: Array<{ method: string; pathname: string }> = [];
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const isCategory = /^\/api\/v1\/accounts\/1\/categories(?:\/\d+)?$/.test(
      url.pathname,
    );
    if (isCategory) {
      calls.push({ method: request.method(), pathname: url.pathname });
      if (request.method() === "GET") {
        await readBarrier?.wait();
        if (failure === "schema") {
          await route.fulfill({ json: { items: [] } });
          return;
        }
        if (failure === "server") {
          await route.fulfill({
            status: 400,
            json: {
              statusCode: 400,
              code: "READ_FAILED",
              message: "Чтение недоступно",
            },
          });
          return;
        }
      } else {
        await writeBarrier?.wait();
      }
    }
    const response = await route.fetch({
      url: backendUrl + url.pathname + url.search,
    });
    await route.fulfill({ response });
  });
  return {
    calls,
    holdReads() {
      const barrier = new ResponseBarrier();
      readBarrier = barrier;
      return barrier;
    },
    holdWrites() {
      const barrier = new ResponseBarrier();
      writeBarrier = barrier;
      return barrier;
    },
    failReads(mode?: "server" | "schema") {
      failure = mode;
    },
  };
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

for (const colorScheme of ["light", "dark"] as const) {
  test(`categories keep forms ready while initial reads wait in ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    const api = await installApi(page, backend.url);
    const category = await createCategory(
      page,
      backend.url,
      `Начальная ${colorScheme}`,
    );
    const reads = api.holdReads();
    try {
      await page.goto("/categories");
      await expect.poll(() => reads.heldCount).toBeGreaterThan(0);
      const list = page.getByRole("group", {
        name: "Список категорий",
        exact: true,
      });
      const deletion = page.getByRole("group", {
        name: "Удаление категории",
        exact: true,
      });
      const creation = page.getByRole("group", {
        name: "Создание новой категории",
        exact: true,
      });
      await expect(list.getByRole("status")).toBeVisible();
      await expect(deletion.getByRole("status")).toBeVisible();
      await expect(creation.getByLabel("Наименование категории")).toBeEnabled();
      await creation
        .getByLabel("Наименование категории")
        .fill("Доступный ввод");
      await expect(
        creation.getByRole("button", { name: "Создать", exact: true }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "доходы", exact: true }),
      ).toBeEnabled();
      const decoration = list
        .getByRole("status")
        .locator('div[aria-hidden="true"]')
        .first();
      await expect(decoration).toBeVisible();
      expect(
        await decoration.evaluate(
          (node) => getComputedStyle(node).animationName,
        ),
      ).toBe("none");
      await assertLayout(page, 390);
      await page.screenshot({
        path: testInfo.outputPath(
          `categories-initial-mobile-${colorScheme}.png`,
        ),
        fullPage: true,
      });
      await page.setViewportSize({ width: 1280, height: 900 });
      await assertLayout(page, 1280);
      await page.screenshot({
        path: testInfo.outputPath(
          `categories-initial-desktop-${colorScheme}.png`,
        ),
        fullPage: true,
      });
      reads.release();
      await expect(
        page.getByRole("button", {
          name: `Изменить категорию ${category.name}`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(list.getByRole("status")).toHaveCount(0);
      const beforeReturn = api.calls.filter(
        (call) => call.method === "GET",
      ).length;
      await page.getByRole("link", { name: "Дашборд", exact: true }).click();
      await page.getByRole("link", { name: "Категории", exact: true }).click();
      await expect(
        page.getByRole("button", {
          name: `Изменить категорию ${category.name}`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("group", { name: "Список категорий", exact: true })
          .getByRole("status"),
      ).toHaveCount(0);
      expect(api.calls.filter((call) => call.method === "GET")).toHaveLength(
        beforeReturn,
      );
    } finally {
      reads.release();
    }
  });

  test(`categories recover from invalid initial data with local retry in ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    const api = await installApi(page, backend.url);
    const category = await createCategory(
      page,
      backend.url,
      `После повтора ${colorScheme}`,
    );
    api.failReads("schema");
    await page.goto("/categories");
    const list = page.getByRole("group", {
      name: "Список категорий",
      exact: true,
    });
    const deletion = page.getByRole("group", {
      name: "Удаление категории",
      exact: true,
    });
    await expect(list.getByRole("button", { name: /Повторить/ })).toBeVisible();
    await expect(
      deletion.getByRole("button", { name: /Повторить/ }),
    ).toBeVisible();
    await expect(list.getByRole("status")).toHaveCount(0);
    await expect(
      page
        .getByRole("group", { name: "Создание новой категории", exact: true })
        .getByLabel("Наименование категории"),
    ).toBeEnabled();
    await assertLayout(page, 390);
    await page.screenshot({
      path: testInfo.outputPath(`categories-error-retry-${colorScheme}.png`),
      fullPage: true,
    });
    const beforeRetry = api.calls.filter(
      (call) => call.method === "GET",
    ).length;
    api.failReads();
    await list.getByRole("button", { name: /Повторить/ }).click();
    await expect(
      page.getByRole("button", {
        name: `Изменить категорию ${category.name}`,
        exact: true,
      }),
    ).toBeVisible();
    expect(api.calls.filter((call) => call.method === "GET")).toHaveLength(
      beforeRetry + 1,
    );
    await expect(list.getByRole("button", { name: /Повторить/ })).toHaveCount(
      0,
    );
  });

  test(`category writes finish while background reads wait and fail in ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    const api = await installApi(page, backend.url);
    const category = await createCategory(
      page,
      backend.url,
      `Черновик ${colorScheme}`,
    );
    await page.goto("/categories");
    await page
      .getByRole("button", {
        name: `Изменить категорию ${category.name}`,
        exact: true,
      })
      .click();
    const editor = page.getByRole("group", {
      name: `Редактирование категории ${category.name}`,
      exact: true,
    });
    await editor
      .getByLabel("Наименование категории")
      .fill("Сохранённый черновик");
    const creation = page.getByRole("group", {
      name: "Создание новой категории",
      exact: true,
    });
    const createdName = `Созданная без ожидания ${colorScheme}`;
    await creation.getByLabel("Наименование категории").fill(createdName);
    const writes = api.holdWrites();
    const reads = api.holdReads();
    try {
      await creation
        .getByRole("button", { name: "Создать", exact: true })
        .click();
      await expect.poll(() => writes.heldCount).toBe(1);
      await expect(
        creation.getByRole("button", { name: /Создани/ }),
      ).toBeDisabled();
      await expect(
        editor.getByRole("button", { name: "Сохранить", exact: true }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "доходы", exact: true }),
      ).toBeEnabled();
      await page.screenshot({
        path: testInfo.outputPath(`categories-local-create-${colorScheme}.png`),
        fullPage: true,
      });
      writes.release();
      await expect.poll(() => reads.heldCount).toBeGreaterThan(0);
      await expect(creation.getByLabel("Наименование категории")).toHaveValue(
        "",
      );
      await expect(
        creation.getByRole("button", { name: "Создать", exact: true }),
      ).toBeVisible();
      await expect(editor.getByLabel("Наименование категории")).toHaveValue(
        "Сохранённый черновик",
      );
      const list = page.getByRole("group", {
        name: "Список категорий",
        exact: true,
      });
      await expect(list.getByRole("status")).toHaveCount(0);
      await assertLayout(page, 390);
      await page.screenshot({
        path: testInfo.outputPath(
          `categories-background-pending-${colorScheme}.png`,
        ),
        fullPage: true,
      });
      api.failReads("server");
      reads.release();
      await expect(
        list.getByRole("button", { name: /Повторить/ }),
      ).toBeVisible();
      await expect(editor.getByLabel("Наименование категории")).toHaveValue(
        "Сохранённый черновик",
      );
      await expect(
        page.getByRole("button", {
          name: `Изменить категорию ${category.name}`,
          exact: true,
        }),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(
          `categories-background-error-${colorScheme}.png`,
        ),
        fullPage: true,
      });
      api.failReads();
      await list.getByRole("button", { name: /Повторить/ }).click();
      await expect(
        page.getByRole("button", {
          name: `Изменить категорию ${createdName}`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(editor.getByLabel("Наименование категории")).toHaveValue(
        "Сохранённый черновик",
      );
      expect(api.calls.filter((call) => call.method === "POST")).toHaveLength(
        1,
      );
    } finally {
      writes.release();
      reads.release();
    }
  });
}
