import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { TransactionsCategorySummaryParams } from "@/common/api/generate/model";
import { invalidateTransactionsCategorySummary } from "@/modules/transactions";

import type { ReportsPeriodRanges } from "../period.ts";
import {
  type ReportsTransactionType,
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
const defaultOptions = queryClient.getDefaultOptions();

beforeEach(() => {
  queryClient.clear();
  queryClient.setDefaultOptions({
    ...defaultOptions,
    queries: { ...defaultOptions.queries, retry: false },
  });
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
  queryClient.setDefaultOptions(defaultOptions);
});

function responseBarrier() {
  let release: (response: Response) => void = () => {};
  const promise = new Promise<Response>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

function reportsHttp(respond: (url: URL) => Response | Promise<Response>) {
  const calls: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      calls.push(url);
      return respond(url);
    }),
  );
  return calls;
}

function failedResponse(mode: "server" | "schema" | "network") {
  if (mode === "network") throw new TypeError("Network unavailable");
  if (mode === "schema") return Response.json({ categories: [] });
  return Response.json(
    { statusCode: 500, code: "REPORT_FAILED", message: "Read failed" },
    { status: 500 },
  );
}

describe("reports read state and cache lifetime", () => {
  it("rejects invalid pre-existing cache without showing it as empty success", async () => {
    seedMe(42);
    const calls = reportsHttp((url) =>
      Response.json(
        url.pathname.endsWith("category-summary")
          ? summaryPayload
          : transactionsPayload,
      ),
    );
    const useRead = () => ({
      summary: useReportsCategorySummary(RANGES, "expense"),
      operations: useReportsCategoryTransactions({
        categoryId: 3,
        ...RANGES.current,
        type: "expense",
      }),
    });
    const first = renderHook(useRead, { wrapper });
    await waitFor(() =>
      expect(first.result.current.operations.hasValidData).toBe(true),
    );
    await waitFor(() =>
      expect(first.result.current.summary.hasValidData).toBe(true),
    );
    first.unmount();
    queryClient.setQueriesData(
      { predicate: (query) => query.queryKey.includes("category-summary") },
      { categories: [] },
    );
    queryClient.setQueriesData(
      { predicate: (query) => query.queryKey.includes("list") },
      { items: [] },
    );
    const second = renderHook(useRead, { wrapper });
    expect(second.result.current.summary).toMatchObject({
      hasValidData: false,
      isError: true,
      isLoading: false,
      summary: undefined,
    });
    expect(second.result.current.operations).toMatchObject({
      hasValidData: false,
      isError: true,
      isLoading: false,
      transactions: [],
    });
    expect(calls).toHaveLength(2);
  });

  it.each(["range", "type", "category"] as const)(
    "isolates a %s A→B→A transition and ignores the late B response",
    async (change) => {
      seedMe(42);
      type Context = {
        ranges: ReportsPeriodRanges;
        type: ReportsTransactionType;
        categoryId: number;
      };
      const contextA: Context = {
        ranges: RANGES,
        type: "expense",
        categoryId: 3,
      };
      const contextB: Context = {
        ranges:
          change === "range"
            ? { ...RANGES, current: { from: "2026-10-10", to: "2026-10-20" } }
            : RANGES,
        type: change === "type" ? "income" : "expense",
        categoryId: change === "category" ? 4 : 3,
      };
      const lateSummary = responseBarrier();
      const lateOperations = responseBarrier();
      const isB = (url: URL) =>
        change === "range"
          ? url.searchParams.get("from") === "2026-10-10"
          : change === "type"
            ? url.searchParams.get("type") === "income"
            : url.searchParams.get("categoryId") === "4";
      const calls = reportsHttp((url) => {
        if (isB(url))
          return url.pathname.endsWith("category-summary")
            ? lateSummary.promise
            : lateOperations.promise;
        return Response.json(
          url.pathname.endsWith("category-summary")
            ? summaryPayload
            : transactionsPayload,
        );
      });
      const { result, rerender } = renderHook(
        ({ ranges, type, categoryId }) => ({
          summary: useReportsCategorySummary(ranges, type),
          operations: useReportsCategoryTransactions({
            categoryId,
            ...ranges.current,
            type,
          }),
        }),
        { wrapper, initialProps: contextA },
      );
      try {
        await waitFor(() =>
          expect(result.current.summary.hasValidData).toBe(true),
        );
        await waitFor(() =>
          expect(result.current.operations.hasValidData).toBe(true),
        );
        rerender(contextB);
        expect(result.current.operations.transactions).toEqual([]);
        if (change !== "category")
          expect(result.current.summary.summary).toBeUndefined();
        await waitFor(() =>
          expect(calls.filter(isB)).toHaveLength(change === "category" ? 1 : 2),
        );
        rerender(contextA);
        expect(result.current.summary.summary).toEqual(summaryPayload);
        expect(result.current.operations.transactions).toMatchObject(
          transactionsPayload,
        );
        await act(async () => {
          lateSummary.release(
            Response.json({ ...summaryPayload, totalAmount: 900 }),
          );
          lateOperations.release(
            Response.json([
              {
                ...transactionsPayload[0],
                id: 202,
                amount: 900,
                description: "Поздний B",
              },
            ]),
          );
        });
        expect(result.current.summary.summary?.totalAmount).toBe(100);
        expect(result.current.operations.transactions).toMatchObject(
          transactionsPayload,
        );
        expect(
          result.current.operations.transactions.some(
            (operation) => operation.description === "Поздний B",
          ),
        ).toBe(false);
      } finally {
        lateSummary.release(Response.json(summaryPayload));
        lateOperations.release(Response.json(transactionsPayload));
      }
    },
  );

  it("keeps no-account and closed operations disabled", () => {
    queryClient.setQueryData(getAuthMeQueryKey(), { accounts: [], userId: 1 });
    const calls = reportsHttp(() => {
      throw new Error("Unexpected request");
    });
    const { result } = renderHook(
      () => ({
        summary: useReportsCategorySummary(RANGES, "expense"),
        operations: useReportsCategoryTransactions({
          categoryId: null,
          ...RANGES.current,
          type: "expense",
        }),
      }),
      { wrapper },
    );

    expect(result.current.summary).toMatchObject({
      hasAccount: false,
      hasValidData: false,
      isLoading: false,
      isFetching: false,
      isError: false,
      summary: undefined,
    });
    expect(result.current.operations).toMatchObject({
      hasAccount: false,
      hasValidData: false,
      isLoading: false,
      isFetching: false,
      isError: false,
      transactions: [],
    });
    expect(calls).toHaveLength(0);
  });

  it("shows active initial loading and reuses fresh summary and operations on remount", async () => {
    seedMe(42);
    const summary = responseBarrier();
    const operations = responseBarrier();
    const calls = reportsHttp((url) =>
      url.pathname.endsWith("category-summary")
        ? summary.promise
        : operations.promise,
    );
    const useRead = () => ({
      summary: useReportsCategorySummary(RANGES, "expense"),
      operations: useReportsCategoryTransactions({
        categoryId: 3,
        ...RANGES.current,
        type: "expense",
      }),
    });
    const first = renderHook(useRead, { wrapper });
    try {
      await waitFor(() => expect(calls).toHaveLength(2));
      expect(first.result.current.summary).toMatchObject({
        isLoading: true,
        hasValidData: false,
      });
      expect(first.result.current.operations).toMatchObject({
        isLoading: true,
        hasValidData: false,
      });
      await act(async () => {
        summary.release(Response.json(summaryPayload));
        operations.release(Response.json(transactionsPayload));
      });
      await waitFor(() =>
        expect(first.result.current.summary.hasValidData).toBe(true),
      );
      await waitFor(() =>
        expect(first.result.current.operations.hasValidData).toBe(true),
      );
      first.unmount();
      const second = renderHook(useRead, { wrapper });
      expect(second.result.current.summary).toMatchObject({
        summary: summaryPayload,
        isLoading: false,
      });
      expect(second.result.current.operations.transactions).toMatchObject(
        transactionsPayload,
      );
      expect(calls).toHaveLength(2);
      second.unmount();
    } finally {
      summary.release(Response.json(summaryPayload));
      operations.release(Response.json(transactionsPayload));
    }
  });

  it.each(["server", "schema", "network"] as const)(
    "distinguishes initial %s failure from empty and recovers with local refetch",
    async (mode) => {
      seedMe(42);
      let failed = true;
      reportsHttp((url) =>
        failed
          ? failedResponse(mode)
          : Response.json(
              url.pathname.endsWith("category-summary") ? summaryPayload : [],
            ),
      );
      const { result } = renderHook(
        () => ({
          summary: useReportsCategorySummary(RANGES, "expense"),
          operations: useReportsCategoryTransactions({
            categoryId: 3,
            ...RANGES.current,
            type: "expense",
          }),
        }),
        { wrapper },
      );
      await waitFor(() => expect(result.current.summary.isError).toBe(true));
      await waitFor(() => expect(result.current.operations.isError).toBe(true));
      expect(result.current.summary).toMatchObject({
        hasValidData: false,
        summary: undefined,
        isLoading: false,
      });
      expect(result.current.operations).toMatchObject({
        hasValidData: false,
        transactions: [],
        isLoading: false,
      });

      failed = false;
      await act(async () => {
        await Promise.all([
          result.current.summary.refetch(),
          result.current.operations.refetch(),
        ]);
      });
      await waitFor(() =>
        expect(result.current.summary).toMatchObject({
          isError: false,
          summary: summaryPayload,
        }),
      );
      await waitFor(() =>
        expect(result.current.operations).toMatchObject({
          isError: false,
          hasValidData: true,
          transactions: [],
        }),
      );
    },
  );

  it.each(["server", "schema", "network"] as const)(
    "retains same-key valid data through held refresh and terminal %s failure",
    async (mode) => {
      seedMe(42);
      let phase: "success" | "held" | "failure" = "success";
      const summary = responseBarrier();
      const operations = responseBarrier();
      const calls = reportsHttp((url) => {
        const isSummary = url.pathname.endsWith("category-summary");
        if (phase === "held")
          return isSummary ? summary.promise : operations.promise;
        if (phase === "failure") return failedResponse(mode);
        return Response.json(isSummary ? summaryPayload : transactionsPayload);
      });
      const { result } = renderHook(
        () => ({
          summary: useReportsCategorySummary(RANGES, "expense"),
          operations: useReportsCategoryTransactions({
            categoryId: 3,
            ...RANGES.current,
            type: "expense",
          }),
        }),
        { wrapper },
      );
      await waitFor(() =>
        expect(result.current.summary.hasValidData).toBe(true),
      );
      await waitFor(() =>
        expect(result.current.operations.hasValidData).toBe(true),
      );
      phase = "held";
      let refreshing: Promise<unknown> | undefined;
      try {
        act(() => {
          refreshing = Promise.all([
            result.current.summary.refetch(),
            result.current.operations.refetch(),
          ]);
        });
        await waitFor(() => expect(calls).toHaveLength(4));
        expect(result.current.summary).toMatchObject({
          isFetching: true,
          isLoading: false,
          summary: summaryPayload,
        });
        expect(result.current.operations).toMatchObject({
          isFetching: true,
          isLoading: false,
        });
        expect(result.current.operations.transactions).toMatchObject(
          transactionsPayload,
        );
        await act(async () => {
          summary.release(Response.json(summaryPayload));
          operations.release(Response.json(transactionsPayload));
          await refreshing;
        });
        phase = "failure";
        await act(async () => {
          await Promise.all([
            result.current.summary.refetch(),
            result.current.operations.refetch(),
          ]);
        });
        await waitFor(() =>
          expect(result.current.summary).toMatchObject({
            isError: true,
            hasValidData: true,
            summary: summaryPayload,
          }),
        );
        await waitFor(() =>
          expect(result.current.operations).toMatchObject({
            isError: true,
            hasValidData: true,
          }),
        );
        expect(result.current.operations.transactions).toMatchObject(
          transactionsPayload,
        );
      } finally {
        summary.release(Response.json(summaryPayload));
        operations.release(Response.json(transactionsPayload));
        await refreshing;
      }
    },
  );

  it("does not borrow or overwrite data across account, range, type, or category keys", async () => {
    seedMe(42);
    const oldSummary = responseBarrier();
    const oldOperations = responseBarrier();
    const calls = reportsHttp((url) => {
      if (
        url.pathname.includes("/42/") &&
        url.searchParams.get("type") === "expense"
      ) {
        return url.pathname.endsWith("category-summary")
          ? oldSummary.promise
          : oldOperations.promise;
      }
      return Response.json(
        url.pathname.endsWith("category-summary")
          ? {
              ...summaryPayload,
              totalAmount: 900,
              categories: [
                {
                  ...summaryPayload.categories[0],
                  categoryName: "Новый контекст",
                },
              ],
            }
          : [
              {
                ...transactionsPayload[0],
                id: 202,
                accountId: 43,
                categoryId: 4,
                type: "income",
                description: "Новая операция",
              },
            ],
      );
    });
    type ReadContext = {
      ranges: ReportsPeriodRanges;
      type: ReportsTransactionType;
      categoryId: number;
    };
    const firstContext: ReadContext = {
      ranges: RANGES,
      type: "expense",
      categoryId: 3,
    };
    const secondContext: ReadContext = {
      ranges: {
        current: { from: "2026-10-10", to: "2026-10-20" },
        compare: RANGES.compare,
      },
      type: "income",
      categoryId: 4,
    };
    const { result, rerender } = renderHook(
      ({ ranges, type, categoryId }) => ({
        summary: useReportsCategorySummary(ranges, type),
        operations: useReportsCategoryTransactions({
          categoryId,
          ...ranges.current,
          type,
        }),
      }),
      { wrapper, initialProps: firstContext },
    );
    try {
      await waitFor(() => expect(calls).toHaveLength(2));
      act(() => seedMe(43));
      rerender(secondContext);
      expect(result.current.summary.summary).toBeUndefined();
      expect(result.current.operations.transactions).toEqual([]);
      await waitFor(() =>
        expect(result.current.summary.summary?.totalAmount).toBe(900),
      );
      await waitFor(() =>
        expect(result.current.operations.transactions[0]?.description).toBe(
          "Новая операция",
        ),
      );
      await act(async () => {
        oldSummary.release(Response.json(summaryPayload));
        oldOperations.release(Response.json(transactionsPayload));
      });
      expect(result.current.summary.summary?.totalAmount).toBe(900);
      expect(result.current.operations.transactions[0]?.description).toBe(
        "Новая операция",
      );
      expect(
        calls.some(
          (url) =>
            url.pathname.includes("/43/") &&
            url.searchParams.get("type") === "income",
        ),
      ).toBe(true);
      expect(
        calls.some((url) => url.searchParams.get("categoryId") === "4"),
      ).toBe(true);
    } finally {
      oldSummary.release(Response.json(summaryPayload));
      oldOperations.release(Response.json(transactionsPayload));
    }
  });
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
      Response.json({
        accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
        userId: 1,
      }),
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
    await waitFor(() => expect(categorySummaryCalls()).toHaveLength(2));
    expect(result.current.summary?.transactionCount).toBe(4);
  });
});

describe("useReportsCategoryTransactions AND of me-guard and categoryId", () => {
  it("stays disabled for categoryId null even with a known account", async () => {
    seedMe(42);
    const { calls } = stubFetch(() =>
      Response.json({
        accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
        userId: 1,
      }),
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
        calls().filter((url) =>
          url.includes("/api/v1/accounts/42/transactions?"),
        ),
      ).toHaveLength(0),
    );
    expect(result.current.transactions).toHaveLength(0);
    expect(calls()).toHaveLength(0);
  });

  it("fetches the scoped list once when a category is selected", async () => {
    seedMe(42);
    const { listCalls } = stubFetch(() =>
      Response.json({
        accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
        userId: 1,
      }),
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
