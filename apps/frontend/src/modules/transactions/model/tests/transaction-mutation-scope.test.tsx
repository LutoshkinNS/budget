import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type {
  TransactionsCategorySummaryParams,
  TransactionsListParams,
} from "@/common/api/generate/model";

import { transactionKeys } from "../transaction-keys.ts";
import { useCreateTransaction } from "../use-create-transaction.ts";
import { useDeleteTransaction } from "../use-delete-transaction.ts";
import { useUpdateTransaction } from "../use-update-transaction.ts";

const mocks = vi.hoisted(() => ({
  create: vi.fn<() => Promise<{ id: 1 }>>(),
  update: vi.fn<() => Promise<{ id: 5 }>>(),
  delete: vi.fn<() => Promise<void>>(),
  invalidateCategories: vi.fn(),
}));

// Категорийный кэш инвалидируется публичной командой модуля categories:
// тест проверяет вызов команды, не строя ключи чужого домена
vi.mock("@/modules/categories", () => ({
  invalidateCategories: mocks.invalidateCategories,
}));

// Контекст мутации теперь содержит снапшот счёта конкретного вызова
type MutationContext = { accountId: number | undefined } | undefined;

// Мутации управляются тестом: резолв отложен, чтобы менять authMe между
// вызовом мутации (снятие снапшота в onMutate) и onSuccess (применение
// инвалидаций). Порядок фаз повторяет TanStack: onMutate → mutationFn →
// onSuccess с контекстом третьим аргументом
const pendingMutations: Array<() => void> = [];

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
            data: { id: 1 },
            variables: unknown,
            context: MutationContext,
          ) => Promise<unknown> | unknown;
        };
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const context = await options.mutation.onMutate?.();
          await new Promise<void>((resolve) => pendingMutations.push(resolve));
          const result = await mocks.create();
          await options.mutation.onSuccess?.(result, variables, context);
          return result;
        },
      }),
      useTransactionsUpdate: (options: {
        mutation: {
          onMutate?: () => MutationContext;
          onSuccess?: (
            data: { id: 5 },
            variables: unknown,
            context: MutationContext,
          ) => Promise<unknown> | unknown;
        };
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const context = await options.mutation.onMutate?.();
          await new Promise<void>((resolve) => pendingMutations.push(resolve));
          const result = await mocks.update();
          await options.mutation.onSuccess?.(result, variables, context);
          return result;
        },
      }),
      useTransactionsDelete: (options: {
        mutation: {
          onMutate?: () => MutationContext;
          onSuccess?: (
            data: undefined,
            variables: { transactionId: number },
            context: MutationContext,
          ) => Promise<unknown> | unknown;
        };
      }) => ({
        mutateAsync: async (variables: { transactionId: number }) => {
          const context = await options.mutation.onMutate?.();
          await new Promise<void>((resolve) => pendingMutations.push(resolve));
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

const LIST_PARAMS: TransactionsListParams = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-02T00:00:00.000Z",
  type: "expense",
};
const SUMMARY_PARAMS = { from: "2026-10-01", to: "2026-10-02" };
const CATEGORY_SUMMARY_PARAMS: TransactionsCategorySummaryParams = {
  from: "2026-10-01",
  to: "2026-10-02",
  compareFrom: "2026-09-01",
  compareTo: "2026-10-01",
};

function seedMe(currentAccountId: number) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [
      { id: currentAccountId, name: "Счёт", initialBalance: 0, isOwner: true },
    ],
    userId: 1,
  });
}

// Сиды поддеревьев обоих счетов + несвязанный ключ
function seedTrees() {
  queryClient.setQueryData(transactionKeys.list(42, LIST_PARAMS), []);
  queryClient.setQueryData(transactionKeys.summary(42, SUMMARY_PARAMS), []);
  queryClient.setQueryData(transactionKeys.detail(42, 5), {});
  queryClient.setQueryData(
    transactionKeys.categorySummary(42, CATEGORY_SUMMARY_PARAMS),
    [],
  );

  queryClient.setQueryData(transactionKeys.list(43, LIST_PARAMS), []);
  queryClient.setQueryData(transactionKeys.summary(43, SUMMARY_PARAMS), []);
  queryClient.setQueryData(transactionKeys.detail(43, 5), {});
  queryClient.setQueryData(
    transactionKeys.categorySummary(43, CATEGORY_SUMMARY_PARAMS),
    [],
  );
  queryClient.setQueryData(["unrelated"], []);
}

// Базовый состав собственных инвалидаций transactions: list, summary,
// category-summary (детали — ниже; у create нет detail-семейства по ТЗ §4);
// категорийные ключи инвалидируются командой categories — spy mocks
const baseKeys42 = [
  transactionKeys.list(42, LIST_PARAMS),
  transactionKeys.summary(42, SUMMARY_PARAMS),
  transactionKeys.categorySummary(42, CATEGORY_SUMMARY_PARAMS),
];
// update и delete дополнительно инвалидируют detail изменённой операции
const detailKey42 = transactionKeys.detail(42, 5);
const keys43 = [
  transactionKeys.list(43, LIST_PARAMS),
  transactionKeys.summary(43, SUMMARY_PARAMS),
  transactionKeys.detail(43, 5),
  transactionKeys.categorySummary(43, CATEGORY_SUMMARY_PARAMS),
];

function invalidated(key: readonly unknown[]) {
  return queryClient.getQueryState(key)?.isInvalidated === true;
}

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

type Operation = "create" | "update" | "delete";

// Резолвер появляется на микротик позже старта mutateAsync (mock ждёт
// завершения await onMutate): ждём его появления, иначе shift() промахнётся
async function resolveMutation(done: Promise<unknown>) {
  await act(async () => {
    await waitFor(() => expect(pendingMutations.length).toBeGreaterThan(0));
    pendingMutations.shift()?.();
    await done;
  });
}

async function runOperation(
  operation: Operation,
): Promise<ReturnType<typeof renderHook>["result"]> {
  if (operation === "create") {
    const { result, rerender } = renderHook(useCreateTransaction, {
      wrapper,
    });
    let done: Promise<unknown> = Promise.resolve();
    act(() => {
      done = result.current.createTransaction({
        type: "expense",
        amount: 10,
        categoryId: 3,
        date: "2026-10-15T09:00:00.000Z",
      });
    });
    await resolveMutation(done);
    rerender();
    return result;
  }
  if (operation === "update") {
    const { result, rerender } = renderHook(() => useUpdateTransaction(5), {
      wrapper,
    });
    let done: Promise<unknown> = Promise.resolve();
    act(() => {
      done = result.current.updateTransaction({
        type: "expense",
        amount: 10,
        categoryId: 3,
        date: "2026-10-15T09:00:00.000Z",
        description: null,
      });
    });
    await resolveMutation(done);
    rerender();
    return result;
  }
  const { result, rerender } = renderHook(useDeleteTransaction, { wrapper });
  let done: Promise<unknown> = Promise.resolve();
  act(() => {
    done = result.current.deleteTransaction(5);
  });
  await resolveMutation(done);
  rerender();
  return result;
}

beforeEach(() => {
  queryClient.clear();
  pendingMutations.length = 0;
  mocks.invalidateCategories.mockReset();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
});

describe("transaction mutations invalidate only the executing account subtree", () => {
  it.each(["create", "update", "delete"] as const)(
    "%s marks only the account 42 subtree stale",
    async (operation) => {
      seedMe(42);
      seedTrees();

      await runOperation(operation);

      for (const key of baseKeys42) expect(invalidated(key)).toBe(true);
      if (operation === "create") {
        // У create нет detail-семейства в составе инвалидаций
        expect(invalidated(detailKey42)).toBe(false);
      } else {
        expect(invalidated(detailKey42)).toBe(true);
      }
      for (const key of keys43) expect(invalidated(key)).toBe(false);
      expect(invalidated(["unrelated"])).toBe(false);
      // Категорийный кэш инвалидируется командой со скопом выполнения
      expect(mocks.invalidateCategories).toHaveBeenCalledWith(42);
      expect(mocks.invalidateCategories).not.toHaveBeenCalledWith(43);
    },
  );

  it("keeps the snapshot scope when the account switches while the mutation is in flight", async () => {
    seedMe(42);
    seedTrees();

    // Мутация запущена на счёте 42 — снапшот уже снят до отправки
    const { result } = renderHook(useCreateTransaction, { wrapper });
    let done: Promise<unknown> = Promise.resolve();
    act(() => {
      done = result.current.createTransaction({
        type: "expense",
        amount: 10,
        categoryId: 3,
        date: "2026-10-15T09:00:00.000Z",
      });
    });

    // Счёт сменился, пока мутация в полёте
    act(() => seedMe(43));

    await resolveMutation(done);

    // Инвалидации применены к поддереву счёта выполнения (42), а не нового
    for (const key of baseKeys42) expect(invalidated(key)).toBe(true);
    for (const key of keys43) expect(invalidated(key)).toBe(false);
    expect(mocks.invalidateCategories).toHaveBeenCalledWith(42);
    expect(mocks.invalidateCategories).not.toHaveBeenCalledWith(43);
  });

});
