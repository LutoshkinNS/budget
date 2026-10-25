import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { useCreateTransaction } from "../use-create-transaction";
import { useDeleteTransaction } from "../use-delete-transaction";
import { useUpdateTransaction } from "../use-update-transaction";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  // Категорийный кэш инвалидируется публичной командой модуля categories:
  // тест проверяет вызов команды, не строя ключи чужого домена
  invalidateCategories: vi.fn(),
}));

type MutationContext = { accountId: number | undefined } | undefined;

vi.mock("@/modules/categories", () => ({
  invalidateCategories: mocks.invalidateCategories,
}));

vi.mock(
  "@/common/api/generate/transactions/transactions.gen.ts",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/common/api/generate/transactions/transactions.gen.ts")
      >();
    return {
      ...actual,
      useTransactionsCreate: (options: {
        mutation: {
          onMutate?: () => MutationContext;
          onSuccess?: (
            data: unknown,
            variables: unknown,
            context: MutationContext,
          ) => unknown;
        };
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const context = await options.mutation.onMutate?.();
          const result = await mocks.create();
          await options.mutation.onSuccess?.(result, variables, context);
          return result;
        },
      }),
      useTransactionsUpdate: (options: {
        mutation: {
          onMutate?: () => MutationContext;
          onSuccess?: (
            data: unknown,
            variables: unknown,
            context: MutationContext,
          ) => unknown;
        };
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const context = await options.mutation.onMutate?.();
          const result = await mocks.update();
          await options.mutation.onSuccess?.(result, variables, context);
          return result;
        },
      }),
      useTransactionsDelete: (options: {
        mutation: {
          onMutate?: () => MutationContext;
          onSuccess?: (
            data: unknown,
            variables: unknown,
            context: MutationContext,
          ) => unknown;
        };
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const context = await options.mutation.onMutate?.();
          const result = await mocks.delete();
          await options.mutation.onSuccess?.(undefined, variables, context);
          return result;
        },
      }),
    };
  },
);
vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  mocks.create.mockReset();
  mocks.update.mockReset();
  mocks.delete.mockReset();
  mocks.invalidateCategories.mockReset();
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
});

describe("transaction category invalidation", () => {
  it.each(["create", "update", "delete"] as const)(
    "invalidates the category cache after a successful %s",
    async (operation) => {
      if (operation === "create") {
        const { result } = renderHook(useCreateTransaction);
        await result.current.createTransaction({
          type: "expense",
          amount: 10,
          categoryId: 3,
          date: "2026-10-15T09:00:00.000Z",
        });
      } else if (operation === "update") {
        const { result } = renderHook(() => useUpdateTransaction(5));
        await result.current.updateTransaction({
          type: "expense",
          amount: 10,
          categoryId: 3,
          date: "2026-10-15T09:00:00.000Z",
          description: null,
        });
      } else {
        const { result } = renderHook(useDeleteTransaction);
        await result.current.deleteTransaction(5);
      }

      await waitFor(() =>
        expect(mocks.invalidateCategories).toHaveBeenCalledWith(42),
      );
    },
  );

  it("does not invalidate categories when an operation mutation fails", async () => {
    const { result } = renderHook(useCreateTransaction);
    mocks.create.mockRejectedValue(new Error("save failed"));

    await expect(
      result.current.createTransaction({
        type: "expense",
        amount: 10,
        categoryId: 3,
        date: "2026-10-15T09:00:00.000Z",
      }),
    ).rejects.toThrow("save failed");
    expect(mocks.invalidateCategories).not.toHaveBeenCalled();
  });
});
