import { defineConfig, devices } from "@playwright/test";

const frontendBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";
const shouldStartFrontend = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "../../output/playwright/frontend/test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "../../output/playwright/frontend/report",
        open: "never",
      },
    ],
  ],
  use: {
    baseURL: frontendBaseUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: shouldStartFrontend
    ? {
        command: "pnpm run dev",
        url: frontendBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
