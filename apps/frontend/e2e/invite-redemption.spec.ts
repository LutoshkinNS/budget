import { expect } from "@playwright/test";

import { AuthMeResponse } from "../src/common/api/generate/authentication/authentication.zod.gen";

import { test } from "./support/invite-fixture";

for (const colorScheme of ["light", "dark"] as const) {
  test(`redeems an invitation before entering its account in ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 390, height: 844 });
    let redeems = 0;
    let refreshedMembership = false;
    await page.route("**/api/v1/**", async (route) => {
      const { pathname, search } = new URL(route.request().url());
      if (pathname === "/api/v1/accounts/invitations/redeem") redeems += 1;
      const response = await route.fetch({
        url: backend.url + pathname + search,
      });
      if (pathname === "/api/v1/auth/me" && redeems > 0 && response.ok()) {
        const profile = AuthMeResponse.parse(await response.json());
        refreshedMembership = profile.accounts.some(
          (account) => account.id === backend.targetAccountId,
        );
      }
      await route.fulfill({ response });
    });
    await page.goto("/login");
    const loggedIn = page.waitForResponse("**/api/v1/auth/dev-login");
    await page.getByRole("button", { name: "Dev login" }).click();
    expect((await loggedIn).ok()).toBe(true);
    await expect(page).toHaveURL("/");

    await page.goto(`/invite/${backend.code}`);
    await expect(page).toHaveURL("/");
    expect(redeems).toBe(1);
    expect(refreshedMembership).toBe(true);
    await page.goto("/settings");
    await page
      .getByRole("combobox")
      .selectOption(String(backend.targetAccountId));
    await expect(
      page
        .getByRole("group", { name: "Настройки выбранного аккаунта" })
        .getByText("Приглашённый бюджет", { exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`invite-mobile-${colorScheme}.png`),
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({
      path: testInfo.outputPath(`invite-desktop-${colorScheme}.png`),
    });
  });
}
