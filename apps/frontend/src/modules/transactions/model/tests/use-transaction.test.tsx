import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { transactionKeys } from "../transaction-keys.ts";
import { useTransaction } from "../use-transaction.ts";

vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

const TRANSACTION = {
  id: 7,
  accountId: 42,
  userId: 1,
  type: "expense",
  amount: 10,
  categoryId: 3,
  date: "2026-10-15T09:00:00.000Z",
};
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
const defaults = queryClient.getDefaultOptions();
function seedMe(hasAccount = true) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
    accounts: hasAccount
      ? [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }]
      : [],
  });
}
beforeEach(() => {
  queryClient.clear();
  queryClient.setDefaultOptions({
    ...defaults,
    queries: { ...defaults.queries, retry: false },
  });
  seedMe();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  queryClient.setDefaultOptions(defaults);
  vi.unstubAllGlobals();
});

describe("useTransaction boundary", () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, 0, -1, 1.5])(
    "does not request invalid id %s",
    (id) => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useTransaction(id), { wrapper });
      expect(result.current.isValidTransactionId).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasValidData).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("does not request a placeholder account when no account is available", () => {
    seedMe(false);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useTransaction(7), { wrapper });
    expect(result.current.hasAccount).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses fresh scoped cache and normalizes omitted description without fetching", () => {
    queryClient.setQueryData(transactionKeys.detail(42, 7), TRANSACTION);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useTransaction(7), { wrapper });
    expect(result.current.hasValidData).toBe(true);
    expect(result.current.data).toEqual({ ...TRANSACTION, description: null });
    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not expose invalid preexisting cache as a transaction", () => {
    queryClient.setQueryData(transactionKeys.detail(42, 7), {
      ...TRANSACTION,
      amount: "bad",
    });
    vi.stubGlobal("fetch", vi.fn());
    const { result } = renderHook(() => useTransaction(7), { wrapper });
    expect(result.current.hasValidData).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it.each([{ amount: "bad" }, { id: 8 }, { accountId: 43 }])(
    "preserves valid cache after invalid response %j",
    async (invalidFields) => {
      const initial = { ...TRANSACTION, description: "Last valid" };
      queryClient.setQueryData(transactionKeys.detail(42, 7), initial);
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => Response.json({ ...initial, ...invalidFields })),
      );
      const { result } = renderHook(() => useTransaction(7), { wrapper });
      await act(async () => {
        await result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.data).toEqual(initial);
      expect(queryClient.getQueryData(transactionKeys.detail(42, 7))).toEqual(
        initial,
      );
    },
  );

  it.each([403, 404])(
    "exposes authoritative %s without treating it as valid initial data",
    async (statusCode) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          Response.json(
            { statusCode, message: "Unavailable" },
            { status: statusCode },
          ),
        ),
      );
      const { result } = renderHook(() => useTransaction(7), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.isForbidden).toBe(statusCode === 403);
      expect(result.current.isNotFound).toBe(statusCode === 404);
      expect(result.current.hasValidData).toBe(false);
      expect(result.current.isLoading).toBe(false);
    },
  );

  it("passes AbortSignal to the transport and discards a late response after cache clear", async () => {
    let release: (response: Response) => void = () => {};
    let signal: AbortSignal | null | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        signal = init?.signal;
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      }),
    );
    const view = renderHook(() => useTransaction(7), { wrapper });
    try {
      await waitFor(() => expect(signal).toBeInstanceOf(AbortSignal));
      act(() => {
        view.unmount();
        queryClient.clear();
      });
      expect(signal?.aborted).toBe(true);
      await act(async () => {
        release(Response.json(TRANSACTION));
      });
      expect(
        queryClient.getQueryData(transactionKeys.detail(42, 7)),
      ).toBeUndefined();
    } finally {
      release(Response.json(TRANSACTION));
    }
  });
});
