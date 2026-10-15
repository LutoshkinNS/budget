import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getCategoriesListQueryKey } from "@/common/api/generate/categories/categories.gen";

import { useCreateTransaction } from "./useCreateTransaction";
import { useDeleteTransaction } from "./useDeleteTransaction";
import { useUpdateTransaction } from "./useUpdateTransaction";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
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
          onSuccess?: (data?: unknown, variables?: unknown) => unknown;
        };
      }) => ({
        mutateAsync: async () => {
          const result = await mocks.create();
          await options.mutation.onSuccess?.();
          return result;
        },
      }),
      useTransactionsUpdate: (options: {
        mutation: {
          onSuccess?: (data?: unknown, variables?: unknown) => unknown;
        };
      }) => ({
        mutateAsync: async () => {
          const result = await mocks.update();
          await options.mutation.onSuccess?.();
          return result;
        },
      }),
      useTransactionsDelete: (options: {
        mutation: {
          onSuccess?: (data?: unknown, variables?: unknown) => unknown;
        };
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const result = await mocks.delete();
          await options.mutation.onSuccess?.(undefined, variables);
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
});

describe("transaction category invalidation", () => {
  it.each(["create", "update", "delete"] as const)(
    "invalidates category lists after a successful %s",
    async (operation) => {
      const invalidateQueries = vi
        .spyOn(queryClient, "invalidateQueries")
        .mockResolvedValue();

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
        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: getCategoriesListQueryKey(),
        }),
      );
    },
  );

  it("does not invalidate categories when an operation mutation fails", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();
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
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: getCategoriesListQueryKey(),
    });
  });
});
