import { expect } from "@playwright/test";

import {
  AccountsCreateInvitationResponse,
  AccountsUpdateResponse,
} from "../src/common/api/generate/accounts/accounts.zod.gen";

import { test } from "./support/category-usage-fixture";

for (const colorScheme of ["light", "dark"] as const) {
  test(`renames an account and creates its invitation in ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      (await page.request.get(backend.url + "/api/v1/auth/dev-login")).ok(),
    ).toBe(true);
    await page.route("**/api/v1/**", async (route) => {
      const { pathname, search } = new URL(route.request().url());
      const response = await route.fetch({
        url: backend.url + pathname + search,
      });
      await route.fulfill({ response });
    });
    await page.goto("/settings");
    await page
      .getByRole("combobox")
      .selectOption(String(backend.primaryAccountId));

    const settings = page.getByRole("group", {
      name: "Настройки выбранного аккаунта",
    });
    await settings.getByRole("button", { name: "Изменить" }).click();
    const name = "Счёт для проверки";
    await settings
      .getByRole("textbox", { name: "Название аккаунта" })
      .fill(name);
    await settings
      .getByRole("textbox", { name: "Начальный баланс" })
      .fill("25,5");
    const update = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
          `/api/v1/accounts/${backend.primaryAccountId}` &&
        response.request().method() === "PATCH",
    );
    await settings.getByRole("button", { name: "Сохранить" }).click();
    const updateResponse = await update;
    expect(updateResponse.ok()).toBe(true);
    expect(
      AccountsUpdateResponse.parse(await updateResponse.json()),
    ).toMatchObject({
      id: backend.primaryAccountId,
      name,
      initialBalance: 25.5,
    });
    await expect(settings.getByText(name)).toBeVisible();

    const invitations = page.getByRole("group", {
      name: "Пригласить в аккаунт",
    });
    const row = invitations.getByRole("group", { name, exact: true });
    const invite = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
          `/api/v1/accounts/${backend.primaryAccountId}/invitations` &&
        response.request().method() === "POST",
    );
    await row.getByRole("button", { name: /пригласить/i }).click();
    const inviteResponse = await invite;
    expect(inviteResponse.ok()).toBe(true);
    const accepted = AccountsCreateInvitationResponse.parse(
      await inviteResponse.json(),
    );
    expect(accepted.accountId).toBe(backend.primaryAccountId);
    const url = new URL(`/invite/${accepted.code}`, page.url()).href;
    await expect(row.getByText(url, { exact: true })).toBeVisible();
    await expect(invitations.getByText(url, { exact: true })).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath("settings-mobile.png") });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({
      path: testInfo.outputPath("settings-desktop.png"),
    });
  });
}
