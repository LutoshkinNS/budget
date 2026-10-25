import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { TransactionsCategorySummaryParams } from "@/common/api/generate/model";
// Изоляция ключей покрыта собственными тестами transactions; здесь — публичная команда
import { invalidateTransactionsCategorySummary } from "@/modules/transactions";

import {
  useReportsCategorySummary,
  useReportsCategoryTransactions,
} from "../use-category-analytics.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

const RANGES = {
  current: { from: "2026-10-01", to: "2026-10-21" },
  compare: { from: "2026-09-01", to: "2026-09-21" },
};
const SUMMARY_PARAMS: TransactionsCategorySummaryParams = {
  from: RANGES.current.from,
  to: RANGES.current.to,
  compareFrom: RANGES.compare.from,
  compareTo: RANGES.compare.to,
  type: "expense",
};
const summaryPayload = {
  totalAmount: 100,
  previousTotalAmount: 80,
  changePercent: 25,
  transactionCount: 4,
  categories: [
    {
      categoryId: 3,
      categoryName: "Продукты",
      amount: 100,
      percentage: 100,
      previousAmount: 80,
      changePercent: 25,
      transactionCount: 4,
    },
  ],
};
const transactionsPayload = [
  {
    id: 101,
    accountId: 42,
    amount: 100,
    categoryId: 3,
    userId: 1,
    type: "expense",
    date: "2026-10-05T09:00:00.000Z",
  },
];

function seedMe(currentAccountId: number) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [
      { id: currentAccountId, name: "Счёт", initialBalance: 0, isOwner: true },
    ],
    userId: 1,
  });
}

function stubFetch(authMe: () => Response | Promise<Response>) {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      if (url.includes("/api/v1/auth/me")) return authMe();
      if (url.includes("/api/v1/accounts/42/transactions/summary")) {
        throw new Error(`unexpected summary fetch: ${url}`);
      }
      if (url.includes("/api/v1/accounts/42/transactions/category-summary")) {
        return Response.json(summaryPayload);
      }
      if (url.includes("/api/v1/accounts/42/transactions")) {
        return Response.json(transactionsPayload);
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    calls: () => fetchMock.mock.calls.map(([input]) => String(input)),
    categorySummaryCalls: () =>
      fetchMock.mock.calls
        .map(([input]) => String(input))
        .filter((url) => url.includes("/transactions/category-summary")),
    listCalls: () =>
      fetchMock.mock.calls
        .map(([input]) => String(input))
        .filter((url) => url.includes("/api/v1/accounts/42/transactions?")),
  };
}

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient.clear();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("useReportsCategorySummary me-guard and scoped key", () => {
  it("does not run the query while me is loading", async () => {
    const { calls } = stubFetch(() => new Promise<Response>(() => {}));

    renderHook(() => useReportsCategorySummary(RANGES, "expense"), {
      wrapper,
    });

    await waitFor(() =>
      expect(
        calls().filter((url) => url.includes("/transactions")),
      ).toHaveLength(0),
    );
    expect(calls()).toHaveLength(1);
  });

  it("fetches once and refetches after the public category-summary invalidation of the account", async () => {
    seedMe(42);
    const { categorySummaryCalls } = stubFetch(() =>
      Response.json({ accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }], userId: 1 }),
    );

    const { result } = renderHook(
      () => useReportsCategorySummary(RANGES, "expense"),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.summary?.transactionCount).toBe(4),
    );
    expect(categorySummaryCalls()).toHaveLength(1);

    await invalidateTransactionsCategorySummary(42, SUMMARY_PARAMS);
    await waitFor(() =>
      expect(categorySummaryCalls()).toHaveLength(2),
    );
    expect(result.current.summary?.transactionCount).toBe(4);
  });
});

describe("useReportsCategoryTransactions AND of me-guard and categoryId", () => {
  it("stays disabled for categoryId null even with a known account", async () => {
    seedMe(42);
    const { calls } = stubFetch(() =>
      Response.json({ accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }], userId: 1 }),
    );

    const { result } = renderHook(
      () =>
        useReportsCategoryTransactions({
          categoryId: null,
          from: RANGES.current.from,
          to: RANGES.current.to,
          type: "expense",
        }),
      { wrapper },
    );

    await waitFor(() =>
      expect(
        calls().filter((url) => url.includes("/api/v1/accounts/42/transactions?")),
      ).toHaveLength(0),
    );
    expect(result.current.transactions).toHaveLength(0);
    expect(calls()).toHaveLength(0);
  });

  it("fetches the scoped list once when a category is selected", async () => {
    seedMe(42);
    const { listCalls } = stubFetch(() =>
      Response.json({ accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }], userId: 1 }),
    );

    const { result } = renderHook(
      () =>
        useReportsCategoryTransactions({
          categoryId: 3,
          from: RANGES.current.from,
          to: RANGES.current.to,
          type: "expense",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.transactions).toHaveLength(1));
    expect(listCalls()).toHaveLength(1);
  });
});
