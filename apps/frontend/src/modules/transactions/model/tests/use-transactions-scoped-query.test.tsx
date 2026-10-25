import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { transactionKeys } from "../transaction-keys.ts";
import { useTransaction } from "../use-transaction.ts";
import {
  useTransactions,
  useTransactionsCategorySummaryQuery,
  useTransactionSummary,
} from "../use-transactions.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

const RANGE = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-02T00:00:00.000Z",
};
const ME_42 = { accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }], userId: 1 };
const LIST_URL =
  "/api/v1/accounts/42/transactions?from=2026-10-01T00%3A00%3A00.000Z&to=2026-10-02T00%3A00%3A00.000Z";
const SUMMARY_URL =
  "/api/v1/accounts/42/transactions/summary?from=2026-10-01T00%3A00%3A00.000Z&to=2026-10-02T00%3A00%3A00.000Z";

const transactionsPayload = [
  {
    id: 101,
    accountId: 42,
    amount: 10,
    categoryId: 3,
    userId: 1,
    type: "expense",
    date: "2026-10-01T09:00:00.000Z",
  },
];
const summaryPayload = {
  initialBalance: 0,
  incomeTotal: 0,
  expenseTotal: 10,
  periodBalance: -10,
  totalBalance: 90,
};
const categorySummaryPayload = {
  totalAmount: 100,
  previousTotalAmount: 80,
  changePercent: 25,
  transactionCount: 4,
  categories: [],
};

function seedMe(currentAccountId: number) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [
      { id: currentAccountId, name: "Счёт", initialBalance: 0, isOwner: true },
    ],
    userId: 1,
  });
}

// fetch-мок, различающий эндпоинты по URL; ответ authMe управляется тестом
function stubFetch(handlers: { authMe: () => Response | Promise<Response> }) {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      if (url.includes("/api/v1/auth/me")) return handlers.authMe();
      if (url.includes("/api/v1/accounts/42/transactions/category-summary")) {
        return Response.json(categorySummaryPayload);
      }
      if (url.includes("/api/v1/accounts/42/transactions/summary")) {
        return Response.json(summaryPayload);
      }
      if (url.includes("/api/v1/accounts/42/transactions/")) {
        return Response.json({
          ...transactionsPayload[0],
          id: Number(url.split("/").pop()),
        });
      }
      if (url.includes("/api/v1/accounts/42/transactions")) {
        return Response.json(transactionsPayload);
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    fetchMock,
    calls: (prefix: string) =>
      fetchMock.mock.calls
        .map(([input]) => String(input))
        .filter((url) => url.includes(prefix)),
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

describe("useTransactions / useTransactionSummary me-guard", () => {
  it("does not run list or summary queries while me is loading", async () => {
    // authMe не отвечает — счёт неизвестен, account-scoped запросы отключены
    const { calls } = stubFetch({
      authMe: () => new Promise<Response>(() => {}),
    });

    const { result } = renderHook(
      () => ({
        list: useTransactions(RANGE),
        summary: useTransactionSummary(RANGE),
      }),
      { wrapper },
    );

    await waitFor(() => expect(calls("/api/v1/auth/me")).toHaveLength(1));
    expect(result.current.list.isLoading).toBe(false);
    expect(result.current.summary.isLoading).toBe(false);
    expect(calls("/api/v1/accounts/42/transactions")).toHaveLength(0);
  });

  it("runs list and summary exactly once under scoped keys after me is known", async () => {
    seedMe(42);
    const { calls, fetchMock } = stubFetch({
      authMe: () => Response.json(ME_42),
    });

    const { result, rerender } = renderHook(
      () => ({
        list: useTransactions(RANGE),
        summary: useTransactionSummary(RANGE),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.list.transactions).toHaveLength(1),
    );
    await waitFor(() =>
      expect(result.current.summary.data?.totalBalance).toBe(90),
    );

    // Данные легли под скопированными ключами поддерева счёта 42
    expect(queryClient.getQueryData(transactionKeys.list(42, RANGE))).toEqual(
      transactionsPayload,
    );
    expect(
      queryClient.getQueryData(
        transactionKeys.summary(42, { from: RANGE.from, to: RANGE.to }),
      ),
    ).toEqual(summaryPayload);
    // Сгенерированный ключ без счёта не используется
    expect(
      queryClient.getQueryState(["transactionsList", RANGE]),
    ).toBeUndefined();

    // Ре-рендер не порождает лишних запросов
    rerender();
    expect(calls(LIST_URL)).toHaveLength(1);
    expect(calls(SUMMARY_URL)).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("re-mounting a fresh query does not issue an extra GET (staleTime)", async () => {
    seedMe(42);
    const { calls } = stubFetch({ authMe: () => Response.json(ME_42) });

    const first = renderHook(() => useTransactions(RANGE), { wrapper });
    await waitFor(() =>
      expect(first.result.current.transactions).toHaveLength(1),
    );
    first.unmount();

    const second = renderHook(() => useTransactions(RANGE), { wrapper });
    // Кэш отдаётся сразу, без нового GET — семантика staleTime сохранена
    await waitFor(() =>
      expect(second.result.current.transactions).toHaveLength(1),
    );
    expect(calls(LIST_URL)).toHaveLength(1);
    second.unmount();
  });
});

describe("useTransactionsCategorySummaryQuery me-guard and scoped key", () => {
  const CATEGORY_SUMMARY_PARAMS = {
    from: "2026-10-01",
    to: "2026-10-02",
    compareFrom: "2026-09-01",
    compareTo: "2026-09-02",
    type: "expense",
  } as const;

  it("fetches under the scoped category-summary key after me is known", async () => {
    seedMe(42);
    stubFetch({ authMe: () => Response.json(ME_42) });

    const { result } = renderHook(
      () => useTransactionsCategorySummaryQuery(CATEGORY_SUMMARY_PARAMS),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    // Данные легли под скопированным ключом поддерева счёта 42; соседнее
    // поддерево и generated-ключ без счёта не используются
    expect(
      queryClient.getQueryData(
        transactionKeys.categorySummary(42, CATEGORY_SUMMARY_PARAMS),
      ),
    ).toBeDefined();
    expect(
      queryClient.getQueryState(
        transactionKeys.categorySummary(43, CATEGORY_SUMMARY_PARAMS),
      ),
    ).toBeUndefined();
    expect(
      queryClient.getQueryState([
        "transactionsCategorySummary",
        CATEGORY_SUMMARY_PARAMS,
      ]),
    ).toBeUndefined();
  });
});

describe("useTransaction (detail) me-guard and scoped key", () => {
  it("fetches the detail under the account subtree key", async () => {
    seedMe(42);
    stubFetch({ authMe: () => Response.json(ME_42) });

    const { result } = renderHook(() => useTransaction(5), { wrapper });

    await waitFor(() => expect(result.current.data?.id).toBe(5));
    expect(
      queryClient.getQueryData(transactionKeys.detail(42, 5)),
    ).toMatchObject({ id: 5, accountId: 42 });
    expect(queryClient.getQueryState(["transactionsGet", 5])).toBeUndefined();
    expect(
      queryClient.getQueryState(transactionKeys.detail(43, 5)),
    ).toBeUndefined();
  });

  it("stays disabled for an invalid transaction id even with a known account (AND)", async () => {
    seedMe(42);
    const { calls } = stubFetch({ authMe: () => Response.json(ME_42) });

    const zeroId = renderHook(() => useTransaction(0), { wrapper });
    const fractionalId = renderHook(() => useTransaction(1.5), { wrapper });

    // Счёт известен (сид в кэше), но id невалиден — AND-объединение
    // enabled-условий не даёт отправить запрос
    await waitFor(() => expect(calls("/api/v1/auth/me")).toHaveLength(0));
    expect(zeroId.result.current.isValidTransactionId).toBe(false);
    expect(zeroId.result.current.fetchStatus).toBe("idle");
    expect(fractionalId.result.current.isValidTransactionId).toBe(false);
    expect(fractionalId.result.current.fetchStatus).toBe("idle");
    expect(calls("/api/v1/accounts/42/transactions")).toHaveLength(0);
  });
});
