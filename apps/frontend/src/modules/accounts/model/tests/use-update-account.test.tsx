import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAccountsListQueryKey } from "@/common/api/generate/accounts/accounts.gen.ts";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";

import { useUpdateAccount } from "../use-update-account.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

// Проверяем вызов публичной команды, не строя ключи чужого домена
const mocks = vi.hoisted(() => ({
  update: vi.fn<() => Promise<{ success: true }>>(),
  invalidateTransactionSummary: vi.fn(),
}));
vi.mock("@/modules/transactions", () => ({
  invalidateTransactionSummary: mocks.invalidateTransactionSummary,
}));

vi.mock(
  "@/common/api/generate/accounts/accounts.gen.ts",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/common/api/generate/accounts/accounts.gen.ts")
      >();
    return {
      ...actual,
      useAccountsUpdate: (options: {
        mutation: {
          onSuccess?: (
            data: unknown,
            variables: { accountId: number; data: unknown },
          ) => Promise<unknown> | unknown;
        };
      }) => ({
        mutate: async (variables: { accountId: number; data: unknown }) => {
          const result = await mocks.update();
          await options.mutation.onSuccess?.(result, variables);
          return result;
        },
        mutateAsync: async (variables: {
          accountId: number;
          data: unknown;
        }) => {
          const result = await mocks.update();
          await options.mutation.onSuccess?.(result, variables);
          return result;
        },
      }),
    };
  },
);

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient.clear();
  mocks.invalidateTransactionSummary.mockReset();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
});

describe("useUpdateAccount invalidation scope", () => {
  it("invalidates the transactions summary of the target account via the public command, plus user-scope keys", async () => {
    queryClient.setQueryData(getAccountsListQueryKey(), []);
    queryClient.setQueryData(getAuthMeQueryKey(), {
      accounts: [],
      currentAccountId: 42,
      userId: 1,
    });
    queryClient.setQueryData(["unrelated"], []);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(useUpdateAccount, { wrapper });
    const done: { promise?: Promise<unknown> } = {};
    act(() => {
      // Редактируется счёт 43 — команда получает именно его скоп
      done.promise = result.current.mutateAsync({
        accountId: 43,
        data: { name: "Новый" },
      });
    });
    await act(async () => {
      await done.promise;
    });

    // Summary инвалидируется публичной командой transactions со scope цели
    expect(mocks.invalidateTransactionSummary).toHaveBeenCalledWith(43);

    // Пользовательский скоп: accountsList и authMe инвалидируются как раньше
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: getAccountsListQueryKey(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: getAuthMeQueryKey(),
    });
    expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  });
});
