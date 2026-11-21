import { useQueryClient } from "@tanstack/react-query";

import { useTransactionsDelete } from "@/common/api/generate/transactions/transactions.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { invalidateCategories } from "@/modules/categories";
import { requireCurrentAccountId } from "@/modules/user";

import {
  invalidateTransaction,
  invalidateTransactionsCategorySummary,
  invalidateTransactionsList,
  invalidateTransactionSummary,
} from "./transaction-cache.ts";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useTransactionsDelete({
    mutation: {
      onError: (error) => {
        addNotification({
          id: "deleteTransactionError",
          title: "Не удалось удалить операцию",
          message: error?.message,
        });
      },
      // Обратная связь мутации локальна строке, общий overlay исключён.
      meta: { localFeedback: true },
      // Поздний ответ инвалидирует кэш счёта из variables вызова.
      onSuccess: async (_data, variables) => {
        const accountId = variables.accountId;
        await Promise.all([
          invalidateTransactionsList(queryClient, accountId),
          invalidateTransactionSummary(queryClient, accountId),
          invalidateTransactionsCategorySummary(queryClient, accountId),
          invalidateTransaction(
            queryClient,
            accountId,
            variables.transactionId,
          ),
          invalidateCategories(queryClient, accountId),
        ]);
        addNotification({
          id: `deleteTransactionSuccess-${variables.transactionId}-${Date.now()}`,
          type: "success",
          title: "Операция удалена",
        });
      },
    },
  });

  const deleteTransaction = (transactionId: number) => {
    return mutation.mutateAsync({
      accountId: requireCurrentAccountId(queryClient),
      transactionId,
    });
  };

  return {
    deleteTransaction,
    isLoading: mutation.isPending,
    // Ожидание известно для конкретной строки: другие действия остаются доступны.
    pendingTransactionId:
      mutation.isPending && mutation.variables
        ? mutation.variables.transactionId
        : null,
    isError: mutation.isError,
    error: mutation.error,
  };
}
