import { expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { CategoriesCreateResponse } from "../src/common/api/generate/categories/categories.zod.gen";

import { test } from "./support/backend-fixture";

const evidenceDirectory = fileURLToPath(
  new URL(
    "../../../projects/tasks/api-error-notifications/sessions/2026-11-18-native-implementation/evidence/",
    import.meta.url,
  ),
);
const categoriesPath = "/api/v1/accounts/1/categories";
const validationError = {
  message: "Некорректные параметры запроса.",
  statusCode: 400,
};

test.use({ viewport: { width: 1024, height: 900 } });

for (const colorScheme of ["light", "dark"] as const) {
  test(`real categories validation400 retains data and recovers: ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    test.setTimeout(60_000);
    await mkdir(evidenceDirectory, { recursive: true });
    await page.emulateMedia({ colorScheme });
    await page.clock.install();

    const login = await page.request.get(
      backend.url + "/api/v1/auth/dev-login",
    );
    expect(login.ok()).toBeTruthy();
    const names = {
      expense: `Пилот расходы ${colorScheme}`,
      income: `Пилот доходы ${colorScheme}`,
    };
    for (const type of ["expense", "income"] as const) {
      const response = await page.request.post(backend.url + categoriesPath, {
        data: { type, name: names[type] },
      });
      expect(response.status()).toBe(200);
      expect(CategoriesCreateResponse.parse(await response.json()).name).toBe(
        names[type],
      );
    }

    let invalidExpense = false;
    const requests: Array<{
      type: string | null;
      upstreamType: string | null;
      status: number;
      body?: unknown;
    }> = [];
    await page.route("**/api/v1/**", async (route) => {
      const request = route.request();
      const original = new URL(request.url());
      const upstream = new URL(
        original.pathname + original.search,
        backend.url,
      );
      const isList =
        request.method() === "GET" && original.pathname === categoriesPath;
      if (
        isList &&
        invalidExpense &&
        original.searchParams.get("type") === "expense"
      ) {
        upstream.searchParams.set("type", "pilot-invalid");
      }
      const response = await route.fetch({ url: upstream.toString() });
      if (isList) {
        requests.push({
          type: original.searchParams.get("type"),
          upstreamType: upstream.searchParams.get("type"),
          status: response.status(),
          ...(response.status() === 400 && { body: await response.json() }),
        });
      }
      await route.fulfill({ response });
    });

    const list = page.getByRole("group", {
      name: "Список категорий",
      exact: true,
    });
    await page.goto("/categories");
    await expect(list.getByText(names.expense, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "×", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "доходы", exact: true }).click();
    await expect(list.getByText(names.income, { exact: true })).toBeVisible();

    // Тот же expense key уже имеет данные; сдвиг времени делает refetch фоновым.
    await page.clock.fastForward(61_000);
    invalidExpense = true;
    const background = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === "GET" &&
        url.pathname === categoriesPath &&
        url.searchParams.get("type") === "expense"
      );
    });
    await page.getByRole("button", { name: "расходы", exact: true }).click();
    const rejected = await background;
    expect(rejected.status()).toBe(400);
    expect(await rejected.json()).toEqual(validationError);
    await expect(
      page.getByText("Не удалось выполнить запрос", { exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByText(validationError.message, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "×", exact: true }),
    ).toHaveCount(1);
    await expect(list.getByText(names.expense, { exact: true })).toBeVisible();
    await expect(
      list.getByText("Не удалось обновить список категорий", { exact: true }),
    ).toBeVisible();
    expect(requests.filter(({ status }) => status === 400)).toEqual([
      {
        type: "expense",
        upstreamType: "pilot-invalid",
        status: 400,
        body: validationError,
      },
    ]);

    // Снимок сохраняет toast до его штатного истечения через пять секунд.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    const screenshotPath = join(
      evidenceDirectory,
      `tester-browser-${colorScheme}.png`,
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: "disabled",
    });
    await testInfo.attach(`validation400-${colorScheme}`, {
      path: screenshotPath,
      contentType: "image/png",
    });
    await page.clock.resume();

    invalidExpense = false;
    const recovered = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === "GET" &&
        url.pathname === categoriesPath &&
        url.searchParams.get("type") === "expense" &&
        response.status() === 200
      );
    });
    await list.getByRole("button", { name: "Повторить", exact: true }).click();
    expect((await recovered).status()).toBe(200);
    await expect(
      list.getByText("Не удалось обновить список категорий", { exact: true }),
    ).toHaveCount(0);
    await expect(list.getByText(names.expense, { exact: true })).toBeVisible();
    const failedIndex = requests.findIndex(({ status }) => status === 400);
    expect(
      requests.slice(0, failedIndex).every(({ status }) => status === 200),
    ).toBe(true);
    expect(requests.slice(failedIndex).map(({ status }) => status)).toEqual([
      400, 200,
    ]);

    const evidencePath = join(
      evidenceDirectory,
      `tester-browser-${colorScheme}.json`,
    );
    await writeFile(
      evidencePath,
      JSON.stringify({ colorScheme, requests }, null, 2),
    );
    await testInfo.attach(`requests-${colorScheme}`, {
      path: evidencePath,
      contentType: "application/json",
    });
  });
}
