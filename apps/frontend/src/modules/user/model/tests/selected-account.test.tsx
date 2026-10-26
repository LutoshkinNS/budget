import type { PropsWithChildren } from "react";
import { createElement } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

let queryClient: typeof import("@/common/api/appQuery").queryClient;
let QueryClientProvider: typeof import("@tanstack/react-query").QueryClientProvider;
let selectedAccount: typeof import("../selected-account.ts");

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

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

beforeEach(async () => {
  vi.resetModules();
  const [api, query, account] = await Promise.all([
    import("@/common/api/appQuery"),
    import("@tanstack/react-query"),
    import("../selected-account.ts"),
  ]);
  queryClient = api.queryClient;
  QueryClientProvider = query.QueryClientProvider;
  selectedAccount = account;
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
    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBe(42));
  });

  it("restores a valid stored choice regardless of ordering", async () => {
    seedMe();
    window.localStorage.setItem("budget.selected-account", "43");
    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBe(43));
  });

  it("rejects a stored account missing from me.accounts", async () => {
    seedMe();
    window.localStorage.setItem("budget.selected-account", "999");
    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBe(42));
  });

  it("is undefined until me loads and requireCurrentAccountId throws", () => {
    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    expect(result.current).toBeUndefined();
    expect(selectedAccount.getCurrentAccountIdSnapshot()).toBeUndefined();
    expect(() => selectedAccount.requireCurrentAccountId()).toThrow(
      "Текущий счёт не определён",
    );
  });

  it("is undefined with an empty accounts list: no scoped request can start", async () => {
    seedMe([]);
    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeUndefined());
    expect(() => selectedAccount.requireCurrentAccountId()).toThrow(
      "Текущий счёт не определён",
    );
  });

  it("does not reuse the previous user's selection after logout and a new login", async () => {
    seedMe();
    act(() => selectedAccount.switchAccount(43));
    expect(window.localStorage.getItem("budget.selected-account")).toBe("43");

    queryClient.clear();
    seedMe([
      { id: 50, name: "Новый пользователь", initialBalance: 0, isOwner: true },
    ]);

    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBe(50));
    expect(selectedAccount.getCurrentAccountIdSnapshot()).toBe(50);
  });
});

describe("switchAccount", () => {
  it("updates selection reactively and persists it to localStorage", async () => {
    seedMe();
    const { result } = renderHook(() => selectedAccount.useCurrentAccountId(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBe(42));

    act(() => selectedAccount.switchAccount(43));

    await waitFor(() => expect(result.current).toBe(43));
    expect(window.localStorage.getItem("budget.selected-account")).toBe("43");
    expect(selectedAccount.getCurrentAccountIdSnapshot()).toBe(43);
    expect(selectedAccount.requireCurrentAccountId()).toBe(43);
  });

  it("marks the previous account subtree stale without a background refetch", async () => {
    seedMe();
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();
    act(() => selectedAccount.switchAccount(43));

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

    act(() => selectedAccount.switchAccount(42));

    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("budget.selected-account")).toBeNull();
  });

  it("keeps the tab selection when another tab updates localStorage", async () => {
    seedMe();
    window.localStorage.setItem("budget.selected-account", "42");
    expect(selectedAccount.getCurrentAccountIdSnapshot()).toBe(42);
    const { result, rerender } = renderHook(
      () => selectedAccount.useCurrentAccountId(),
      { wrapper },
    );
    await waitFor(() => expect(result.current).toBe(42));

    window.localStorage.setItem("budget.selected-account", "43");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "budget.selected-account",
        oldValue: "42",
        newValue: "43",
        storageArea: window.localStorage,
      }),
    );

    expect(selectedAccount.getCurrentAccountIdSnapshot()).toBe(42);
    expect(selectedAccount.requireCurrentAccountId()).toBe(42);
    rerender();
    expect(result.current).toBe(42);
  });

  it("can switch twice after an external storage write", () => {
    seedMe();
    window.localStorage.setItem("budget.selected-account", "42");
    expect(selectedAccount.requireCurrentAccountId()).toBe(42);

    window.localStorage.setItem("budget.selected-account", "43");
    act(() => selectedAccount.switchAccount(44));
    act(() => selectedAccount.switchAccount(42));

    expect(selectedAccount.requireCurrentAccountId()).toBe(42);
    expect(window.localStorage.getItem("budget.selected-account")).toBe("42");
  });
});
