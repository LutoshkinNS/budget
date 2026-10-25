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
  const { addNotification } = useNotifications();

  const mutation = useTransactionsDelete({
    mutation: {
      onError: (error) => {
        addNotification({
          id: "deleteTransactionError",
          title: error?.code || "Не удалось удалить операцию",
          message: error?.message,
        });
      },
      // Счёт мутации фиксируется её variables — позднее переключение не меняет
      // ни выполнение запроса, ни область инвалидаций
      onSuccess: async (_data, variables) => {
        const accountId = variables.accountId;
        await Promise.all([
          invalidateTransactionsList(accountId),
          invalidateTransactionSummary(accountId),
          invalidateTransactionsCategorySummary(accountId),
          invalidateTransaction(accountId, variables.transactionId),
          invalidateCategories(accountId),
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
      accountId: requireCurrentAccountId(),
      transactionId,
    });
  };

  return {
    deleteTransaction,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
