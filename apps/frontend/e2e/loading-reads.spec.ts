import { expect, type Page } from "@playwright/test";

import type {
  CategoryDTO,
  TransactionDTO,
  UserInfoDTO,
} from "../src/common/api/generate/model";

import { test } from "./support/backend-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  timezoneId: "Europe/Moscow",
});

type Resource = "history" | "summary" | "members" | "categories";
type ScopedResource = { resource: Resource; accountId: number };

const ME: UserInfoDTO = {
  userId: 1,
  accounts: [
    { id: 1, name: "Первый бюджет", initialBalance: 0, isOwner: true },
    { id: 2, name: "Второй бюджет", initialBalance: 0, isOwner: true },
  ],
};
const MEMBERS = [
  { userId: 1, firstName: "Анна", photoUrl: null },
  { userId: 2, firstName: "Пётр", photoUrl: null },
];
const SUMMARY = {
  initialBalance: 0,
  incomeTotal: 300,
  expenseTotal: 200,
  periodBalance: 100,
  totalBalance: 500,
};

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

function transactions(accountId: number): TransactionDTO[] {
  return accountId === 1
    ? [
        {
          id: 101,
          accountId: 1,
          amount: 125,
          categoryId: 3,
          userId: 1,
          type: "expense",
          date: new Date().toISOString(),
          description: "Операция Анны",
        },
        {
          id: 102,
          accountId: 1,
          amount: 75,
          categoryId: 3,
          userId: 2,
          type: "expense",
          date: new Date().toISOString(),
          description: "Операция Петра",
        },
      ]
    : [
        {
          id: 201,
          accountId: 2,
          amount: 90,
          categoryId: 4,
          userId: 3,
          type: "expense",
          date: new Date().toISOString(),
          description: "Операция Марии",
        },
      ];
}

function categories(accountId: number): CategoryDTO[] {
  return [
    {
      id: accountId === 1 ? 3 : 4,
      accountId,
      type: "expense",
      name: accountId === 1 ? "Еда первого счёта" : "Еда второго счёта",
      iconKey: null,
    },
  ];
}

function scopedResource(pathname: string): ScopedResource | undefined {
  const match = pathname.match(
    /^\/api\/v1\/accounts\/(1|2)\/(transactions\/summary|transactions|members|categories)$/,
  );
  if (!match) return undefined;
  const accountId = Number(match[1]);
  if (match[2] === "transactions/summary")
    return { resource: "summary", accountId };
  if (match[2] === "transactions") return { resource: "history", accountId };
  if (match[2] === "members") return { resource: "members", accountId };
  if (match[2] === "categories") return { resource: "categories", accountId };
  return undefined;
}

async function installApi(page: Page, backendUrl: string) {
  const login = await page.request.get(backendUrl + "/api/v1/auth/dev-login");
  expect(login.ok()).toBeTruthy();
  const barriers = new Map<string, ResponseBarrier>();
  const failures = new Set<string>();
  const requests: ScopedResource[] = [];
  const key = (resource: Resource, accountId: number) =>
    `${accountId}:${resource}`;
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === "/api/v1/auth/me") {
      await route.fulfill({ json: ME });
      return;
    }
    const scope =
      request.method() === "GET" ? scopedResource(url.pathname) : undefined;
    if (scope) {
      requests.push(scope);
      await barriers.get(key(scope.resource, scope.accountId))?.wait();
      if (failures.has(key(scope.resource, scope.accountId))) {
        await route.fulfill({
          status: 400,
          json: {
            statusCode: 400,
            code: "REFRESH_FAILED",
            message: "Обновление недоступно",
          },
        });
        return;
      }
      let payload: unknown;
      if (scope.resource === "history") payload = transactions(scope.accountId);
      if (scope.resource === "summary")
        payload =
          scope.accountId === 1 ? SUMMARY : { ...SUMMARY, totalBalance: 910 };
      if (scope.resource === "members")
        payload =
          scope.accountId === 1
            ? MEMBERS
            : [
                { userId: 3, firstName: "Мария" },
                { userId: 4, firstName: "Иван" },
              ];
      if (scope.resource === "categories")
        payload = categories(scope.accountId);
      await route.fulfill({ json: payload });
      return;
    }
    const response = await route.fetch({
      url: backendUrl + url.pathname + url.search,
    });
    await route.fulfill({ response });
  });
  return {
    hold(resource: Resource, accountId = 1) {
      const barrier = new ResponseBarrier();
      barriers.set(key(resource, accountId), barrier);
      return barrier;
    },
    fail(resource: Resource, accountId = 1) {
      failures.add(key(resource, accountId));
    },
    count(resource: Resource, accountId = 1) {
      return requests.filter(
        (entry) => entry.resource === resource && entry.accountId === accountId,
      ).length;
    },
    releaseAll() {
      for (const barrier of barriers.values()) barrier.release();
    },
  };
}

async function expectNoOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth &&
        document.body.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

for (const colorScheme of ["light", "dark"] as const) {
  for (const resource of ["history", "summary", "members"] as const) {
    test(`dashboard keeps other blocks ready while ${resource} waits: ${colorScheme}`, async ({
      page,
      backend,
    }, testInfo) => {
      const api = await installApi(page, backend.url);
      const barrier = api.hold(resource);
      await page.emulateMedia({ colorScheme });
      const statuses = {
        history: page.getByRole("status", { name: "Загрузка операций" }),
        summary: page.getByRole("status", { name: /сводк|итог|сумм/i }),
        members: page.getByRole("status", { name: /участник|пользовател/i }),
      };
      try {
        await page.goto("/dashboard");
        await expect.poll(() => barrier.heldCount).toBeGreaterThan(0);
        await expect(statuses[resource]).toBeVisible();
        await expect(
          statuses[resource].locator('[aria-hidden="true"]').first(),
        ).toBeAttached();
        await expect(
          page.getByRole("heading", { name: "Дашборд" }),
        ).toBeVisible();
        await expect(
          page.getByRole("tab", { name: "день", exact: true }),
        ).toBeEnabled();
        await page.getByLabel("Месяц").focus();
        await expect(page.getByLabel("Месяц")).toBeFocused();
        if (resource !== "history")
          await expect(
            page.getByText("Операция Анны", { exact: true }),
          ).toBeVisible();
        if (resource !== "summary")
          await expect(page.getByText("500 ₽", { exact: true })).toBeVisible();
        if (resource !== "members")
          await expect(
            page.getByRole("tab", { name: "Анна", exact: true }),
          ).toBeVisible();
        await expectNoOverflow(page);
        await page.screenshot({
          path: testInfo.outputPath(
            `${resource}-pending-mobile-${colorScheme}.png`,
          ),
        });
        if (resource === "summary") {
          await page.setViewportSize({ width: 1280, height: 900 });
          await expectNoOverflow(page);
          await page.screenshot({
            path: testInfo.outputPath(
              `summary-pending-desktop-${colorScheme}.png`,
            ),
          });
        }
        barrier.release();
        await expect(statuses[resource]).toHaveCount(0);
        await expect(
          page.getByText("Операция Анны", { exact: true }),
        ).toBeVisible();
        await expect(page.getByText("500 ₽", { exact: true })).toBeVisible();
        await expect(
          page.getByRole("tab", { name: "Анна", exact: true }),
        ).toBeVisible();
      } finally {
        api.releaseAll();
      }
    });
  }

  test(`main history remains readable while category lookup waits: ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    const api = await installApi(page, backend.url);
    const categories = api.hold("categories");
    await page.emulateMedia({ colorScheme });
    try {
      await page.goto("/");
      await expect.poll(() => categories.heldCount).toBeGreaterThan(0);
      await expect(
        page.getByRole("status", { name: "Загрузка категорий" }),
      ).toBeVisible();
      await expect(
        page.getByRole("status", { name: "Загрузка операций" }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Операция Анны", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Операция Анны.*125 ₽/ }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "4", exact: true }).click();
      await expect(page.getByText("4", { exact: true })).toHaveCount(2);
      await expectNoOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath(
          `history-ready-categories-pending-${colorScheme}.png`,
        ),
      });
    } finally {
      api.releaseAll();
    }
  });

  test(`account navigation resets the filter and preserves cached history on background failure: ${colorScheme}`, async ({
    page,
    backend,
  }, testInfo) => {
    const api = await installApi(page, backend.url);
    await page.emulateMedia({ colorScheme });
    try {
      await page.goto("/dashboard");
      await expect(
        page.getByText("Операция Анны", { exact: true }),
      ).toBeVisible();
      const historyRequests = api.count("history");
      const summaryRequests = api.count("summary");
      await page.getByRole("tab", { name: "Пётр", exact: true }).click();
      await expect(
        page.getByText("Операция Анны", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Операция Петра", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("500 ₽", { exact: true })).toBeVisible();
      expect(api.count("history")).toBe(historyRequests);
      expect(api.count("summary")).toBe(summaryRequests);

      await page.getByRole("link", { name: "Настройки", exact: true }).click();
      await page.locator('select[name="account_id"]').selectOption("2");
      await page.getByRole("link", { name: "Дашборд", exact: true }).click();
      await expect(
        page.getByText("Операция Марии", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Операция Анны", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("tab", { name: "все", exact: true }),
      ).toHaveAttribute("aria-selected", "true");

      await page.getByRole("link", { name: "Настройки", exact: true }).click();
      await page.locator('select[name="account_id"]').selectOption("1");
      const refresh = api.hold("history");
      api.fail("history");
      await page.getByRole("link", { name: "Дашборд", exact: true }).click();
      await expect.poll(() => refresh.heldCount).toBeGreaterThan(0);
      await expect(
        page.getByText("Операция Анны", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Операция Петра", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Операция Марии", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("tab", { name: "все", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(
        page.getByRole("status", { name: "Загрузка операций" }),
      ).toHaveCount(0);
      refresh.release();
      await expect(page.getByRole("alert").first()).toBeVisible();
      await expect(
        page.getByText("Операция Анны", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Операция Петра", { exact: true }),
      ).toBeVisible();
      await expectNoOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath(
          `cached-history-background-error-${colorScheme}.png`,
        ),
      });
    } finally {
      api.releaseAll();
    }
  });
}
