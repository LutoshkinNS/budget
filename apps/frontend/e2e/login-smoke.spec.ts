import { expect, test } from "@playwright/test";

test("public login page renders", async ({ page }) => {
  await page.route("**/api/v1/auth/client-event", async (route) => {
    await route.fulfill({ status: 204 });
  });
  await page.route("https://telegram.org/**", async (route) => {
    await route.abort();
  });

  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Dev login" })).toBeVisible();
});
