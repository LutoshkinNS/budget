import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { useTransactionsList } from "@/common/api/generate/transactions/transactions.gen.ts";
import { switchAccount, useCurrentAccountId } from "@/modules/user";

import { transactionKeys } from "../transaction-keys.ts";
import { useTransactions } from "../use-transactions.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

const RANGE = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-02T00:00:00.000Z",
};

const tx42 = [
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
const tx43 = [
  {
    id: 202,
    accountId: 43,
    amount: 20,
    categoryId: 4,
    userId: 1,
    type: "expense",
    date: "2026-10-01T10:00:00.000Z",
  },
];

function seedMe() {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
    accounts: [
      { id: 42, name: "Первый", initialBalance: 0, isOwner: true },
      { id: 43, name: "Второй", initialBalance: 0, isOwner: true },
    ],
  });
}

function createDeferredFetch() {
  const pending: Array<{ url: string; resolve: (body: unknown) => void }> = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      if (!url.includes("/api/v1/accounts/")) {
        throw new Error(`unexpected fetch: ${url}`);
      }
      return new Promise<Response>((resolve) => {
        pending.push({ url, resolve: (body) => resolve(Response.json(body)) });
      });
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    fetchMock,
    lastUrl: () => pending.at(-1)?.url,
    resolveFor: (urlPart: string, body: unknown) => {
      const index = pending.findIndex((entry) => entry.url.includes(urlPart));
      const entry = index === -1 ? undefined : pending[index];
      if (entry === undefined)
        throw new Error(`no pending request: ${urlPart}`);
      pending.splice(index, 1);
      entry.resolve(body);
    },
  };
}

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient.clear();
  window.localStorage.clear();
  seedMe();
  switchAccount(42);
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("account switch isolation", () => {
  it("a late response of the previous account cannot overwrite the new one", async () => {
    seedMe();
    const http = createDeferredFetch();

    // Смонтированный экран счёта 42 сохраняет наблюдатель React Query при переключении.
    const frozenScreen = renderHook(
      () =>
        useTransactionsList(42, RANGE, {
          query: { queryKey: transactionKeys.list(42, RANGE) },
        }),
      { wrapper },
    );
    const { result } = renderHook(
      () => ({
        screen: useTransactions(RANGE),
        accountId: useCurrentAccountId(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(1));
    expect(http.lastUrl()).toContain("/api/v1/accounts/42/transactions");

    act(() => switchAccount(43));
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(2));
    expect(http.lastUrl()).toContain("/api/v1/accounts/43/transactions");

    await act(async () => {
      http.resolveFor("/api/v1/accounts/42/transactions", tx42);
    });
    await waitFor(() =>
      expect(queryClient.getQueryData(transactionKeys.list(42, RANGE))).toEqual(
        tx42,
      ),
    );

    expect(
      queryClient.getQueryData(transactionKeys.list(43, RANGE)),
    ).toBeUndefined();
    expect(result.current.screen.transactions).toHaveLength(0);
    expect(result.current.accountId).toBe(43);

    await act(async () => {
      http.resolveFor("/api/v1/accounts/43/transactions", tx43);
    });
    await waitFor(() =>
      expect(result.current.screen.transactions.map((t) => t.id)).toEqual([
        202,
      ]),
    );
    expect(queryClient.getQueryData(transactionKeys.list(42, RANGE))).toEqual(
      tx42,
    );

    frozenScreen.unmount();
  });

  it("returning to a marked-stale account shows cached data instantly and revalidates in background", async () => {
    seedMe();
    const http = createDeferredFetch();

    const { result } = renderHook(() => useTransactions(RANGE), { wrapper });
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {
      http.resolveFor("/api/v1/accounts/42/transactions", tx42);
    });
    await waitFor(() =>
      expect(result.current.transactions.map((t) => t.id)).toEqual([101]),
    );

    act(() => switchAccount(43));
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(2));
    await act(async () => {
      http.resolveFor("/api/v1/accounts/43/transactions", tx43);
    });
    await waitFor(() =>
      expect(result.current.transactions.map((t) => t.id)).toEqual([202]),
    );
    expect(http.fetchMock).toHaveBeenCalledTimes(2);

    act(() => switchAccount(42));
    await waitFor(() =>
      expect(result.current.transactions.map((t) => t.id)).toEqual([101]),
    );
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(3));
    expect(http.lastUrl()).toContain("/api/v1/accounts/42/transactions");

    await act(async () => {
      http.resolveFor("/api/v1/accounts/42/transactions", [
        { ...tx42[0], amount: 11 },
      ]);
    });
    await waitFor(() =>
      expect(result.current.transactions[0]?.amount).toBe(11),
    );
  });

  it("rapid A→B→A switching keeps every request and cache entry in its own account", async () => {
    seedMe();
    const http = createDeferredFetch();

    const { result } = renderHook(
      () => ({
        screen: useTransactions(RANGE),
        accountId: useCurrentAccountId(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(1));

    act(() => switchAccount(43));
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(2));

    // Возврат к устаревшему счёту запускает повторную сверку.
    act(() => switchAccount(42));
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(3));
    const urls = http.fetchMock.mock.calls.map(([input]) => String(input));
    expect(
      urls.filter((url) => url.includes("/api/v1/accounts/42/transactions")),
    ).toHaveLength(2);
    expect(
      urls.filter((url) => url.includes("/api/v1/accounts/43/transactions")),
    ).toHaveLength(1);
    expect(result.current.accountId).toBe(42);

    await act(async () => {
      http.resolveFor("/api/v1/accounts/43/transactions", tx43);
      http.resolveFor("/api/v1/accounts/42/transactions", tx42);
      http.resolveFor("/api/v1/accounts/42/transactions", tx42);
    });
    await waitFor(() =>
      expect(result.current.screen.transactions.map((t) => t.id)).toEqual([
        101,
      ]),
    );
    expect(
      queryClient.getQueryData(transactionKeys.list(43, RANGE)),
    ).toBeUndefined();
    expect(queryClient.getQueryData(transactionKeys.list(42, RANGE))).toEqual(
      tx42,
    );
  });

  it("switching does not touch auth: the account of every request lives in its URL", async () => {
    seedMe();
    const http = createDeferredFetch();

    const { result } = renderHook(() => useTransactions(RANGE), { wrapper });
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(1));

    act(() => switchAccount(43));
    await waitFor(() => expect(http.fetchMock).toHaveBeenCalledTimes(2));
    const requestedUrls = http.fetchMock.mock.calls.map(([input]) =>
      String(input),
    );
    expect(
      requestedUrls.filter((url) =>
        url.includes("/api/v1/accounts/42/transactions"),
      ),
    ).toHaveLength(1);
    expect(
      requestedUrls.filter((url) =>
        url.includes("/api/v1/accounts/43/transactions"),
      ),
    ).toHaveLength(1);
    // Fetch-мок падает на неизвестном URL, подтверждая отсутствие auth-запросов.
    expect(result.current.transactions).toHaveLength(0);

    await act(async () => {
      http.resolveFor("/api/v1/accounts/43/transactions", tx43);
    });
    await waitFor(() =>
      expect(result.current.transactions.map((t) => t.id)).toEqual([202]),
    );
    expect(
      queryClient.getQueryData(transactionKeys.list(42, RANGE)),
    ).toBeUndefined();
  });
});
