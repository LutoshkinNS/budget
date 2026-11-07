import { expect } from "@playwright/test";

import { test } from "./support/backend-fixture";

test("logs in to Settings and completes a real logout", async ({
  page,
  backend,
}) => {
  await page.route("https://telegram.org/**", (route) => route.abort());
  await page.route("**/api/v1/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    const response = await route.fetch({
      url: backend.url + pathname + search,
    });
    await route.fulfill({ response });
  });

  await page.goto("/login");
  const loginResult = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/v1/auth/dev-login",
  );
  await page.getByRole("button", { name: "Dev login" }).click();
  expect((await loginResult).ok()).toBe(true);
  await expect(page).toHaveURL("/");

  await page.goto("/settings");
  await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();
  const logoutResult = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/v1/auth/logout" &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Выйти" }).click();
  expect((await logoutResult).ok()).toBe(true);
  await expect(page).toHaveURL("/login");

  await page.goto("/settings");
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("button", { name: "Выйти" })).toHaveCount(0);
});
