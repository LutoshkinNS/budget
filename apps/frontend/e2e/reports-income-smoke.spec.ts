import { expect, type Page, test } from "@playwright/test";

const expenseSummary = {
  totalAmount: 12_000,
  previousTotalAmount: 10_000,
  changePercent: 20,
  transactionCount: 2,
  categories: [
    {
      categoryId: 1,
      categoryName: "Еда",
      amount: 12_000,
      percentage: 100,
      previousAmount: 10_000,
      changePercent: 20,
      transactionCount: 2,
    },
  ],
};

const incomeSummary = {
  totalAmount: 80_000,
  previousTotalAmount: 70_000,
  changePercent: 14.3,
  transactionCount: 1,
  categories: [
    {
      categoryId: 2,
      categoryName: "Зарплата",
      amount: 80_000,
      percentage: 100,
      previousAmount: 70_000,
      changePercent: 14.3,
      transactionCount: 1,
    },
  ],
};

async function mockAuthenticatedReportsApi(page: Page) {
  const summaryRequestTypes: string[] = [];
  const transactionListRequests: string[] = [];

  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      json: {
        userId: 1,
        currentAccountId: 1,
        accounts: [
          {
            id: 1,
            name: "Личный бюджет",
            initialBalance: 0,
            isOwner: true,
          },
        ],
      },
    });
  });

  await page.route(
    /\/api\/v1\/transactions\/category-summary\?/,
    async (route) => {
      const requestUrl = new URL(route.request().url());
      const type = requestUrl.searchParams.get("type") ?? "expense";
      summaryRequestTypes.push(type);

      await route.fulfill({
        json: type === "income" ? incomeSummary : expenseSummary,
      });
    },
  );

  await page.route(/\/api\/v1\/transactions\?/, async (route) => {
    const requestUrl = new URL(route.request().url());
    const type = requestUrl.searchParams.get("type") ?? "expense";
    const categoryId = requestUrl.searchParams.get("categoryId") ?? "";
    transactionListRequests.push(`${type}:${categoryId}`);

    await route.fulfill({
      json:
        type === "income"
          ? [
              {
                id: 10,
                accountId: 1,
                amount: 80_000,
                categoryId: 2,
                userId: 1,
                type: "income",
                description: "Премия",
                date: "2026-08-01T10:00:00.000Z",
              },
            ]
          : [],
    });
  });

  return { summaryRequestTypes, transactionListRequests };
}

test("reports show income categories and request income operations", async ({
  page,
}) => {
  const { summaryRequestTypes, transactionListRequests } =
    await mockAuthenticatedReportsApi(page);

  await page.goto("/reports");

  await expect(
    page.getByRole("heading", { name: "Категории расходов" }),
  ).toBeVisible();
  await expect(page.getByText("Еда")).toBeVisible();
  expect(summaryRequestTypes).toContain("expense");

  await page.getByRole("tab", { name: "Доходы" }).click();

  await expect(page).toHaveURL(/type=income/);
  await expect(
    page.getByRole("heading", { name: "Категории доходов" }),
  ).toBeVisible();
  await expect(page.getByText("Зарплата")).toBeVisible();
  await expect(page.getByText("100% от доходов")).toBeVisible();
  expect(summaryRequestTypes).toContain("income");

  await page
    .getByRole("button", {
      name: "Открыть операции категории Зарплата",
    })
    .click();

  await expect(
    page.getByRole("dialog", { name: "Зарплата" }),
  ).toBeVisible();
  await expect(page.getByText("Премия")).toBeVisible();
  expect(transactionListRequests).toContain("income:2");

  await page.getByRole("button", { name: "Закрыть" }).click();
  await page.getByRole("tab", { name: "Расходы" }).click();

  await expect(
    page.getByRole("heading", { name: "Категории расходов" }),
  ).toBeVisible();
  await expect(page.getByText("Еда")).toBeVisible();
});
