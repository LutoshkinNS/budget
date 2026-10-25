import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import {
  getCurrentAccountIdSnapshot,
  requireCurrentAccountId,
  switchAccount,
  useCurrentAccountId,
} from "../selected-account.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

const ACCOUNTS = [
  { id: 42, name: "Первый", initialBalance: 0, isOwner: true },
  { id: 43, name: "Второй", initialBalance: 0, isOwner: false },
  { id: 44, name: "Третий", initialBalance: 0, isOwner: true },
];

function seedMe(accounts: typeof ACCOUNTS | [] = ACCOUNTS) {
  queryClient.setQueryData(getAuthMeQueryKey(), { userId: 1, accounts });
}

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient.clear();
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("selected account resolution", () => {
  it("falls back to the first account without a stored choice", async () => {
    seedMe();
    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    await waitFor(() => expect(result.current).toBe(42));
  });

  it("restores a valid stored choice regardless of ordering", async () => {
    seedMe();
    window.localStorage.setItem("budget.selected-account", "43");
    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    await waitFor(() => expect(result.current).toBe(43));
  });

  it("rejects a stored account missing from me.accounts", async () => {
    seedMe();
    window.localStorage.setItem("budget.selected-account", "999");
    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    await waitFor(() => expect(result.current).toBe(42));
  });

  it("is undefined until me loads and requireCurrentAccountId throws", () => {
    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    expect(result.current).toBeUndefined();
    expect(getCurrentAccountIdSnapshot()).toBeUndefined();
    expect(() => requireCurrentAccountId()).toThrow("Текущий счёт не определён");
  });

  it("is undefined with an empty accounts list: no scoped request can start", async () => {
    seedMe([]);
    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    await waitFor(() => expect(result.current).toBeUndefined());
    expect(() => requireCurrentAccountId()).toThrow("Текущий счёт не определён");
  });

  it("does not reuse the previous user's selection after logout and a new login", async () => {
    seedMe();
    act(() => switchAccount(43));
    expect(window.localStorage.getItem("budget.selected-account")).toBe("43");

    queryClient.clear();
    seedMe([
      { id: 50, name: "Новый пользователь", initialBalance: 0, isOwner: true },
    ]);

    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    await waitFor(() => expect(result.current).toBe(50));
    expect(getCurrentAccountIdSnapshot()).toBe(50);
  });
});

describe("switchAccount", () => {
  it("updates selection reactively and persists it to localStorage", async () => {
    seedMe();
    const { result } = renderHook(() => useCurrentAccountId(), { wrapper });
    await waitFor(() => expect(result.current).toBe(42));

    act(() => switchAccount(43));

    await waitFor(() => expect(result.current).toBe(43));
    expect(window.localStorage.getItem("budget.selected-account")).toBe("43");
    expect(getCurrentAccountIdSnapshot()).toBe(43);
    expect(requireCurrentAccountId()).toBe(43);
  });

  it("marks the previous account subtree stale without a background refetch", async () => {
    seedMe();
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();
    act(() => switchAccount(43));

    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledTimes(1));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["account", 42],
      refetchType: "none",
    });
  });

  it("ignores switching to the current account", () => {
    seedMe();
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    act(() => switchAccount(42));

    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("budget.selected-account")).toBeNull();
  });
});
