import { useTransactionsDelete } from "@/common/api/generate/transactions/transactions.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import {
  useInvalidateTransaction,
  useInvalidateTransactionsCategorySummary,
  useInvalidateTransactionsList,
  useInvalidateTransactionSummary,
} from "./useTransactions.ts";

export function useDeleteTransaction() {
  const invalidateTransaction = useInvalidateTransaction();
  const invalidateTransactionsCategorySummary =
    useInvalidateTransactionsCategorySummary();
  const invalidateTransactionsList = useInvalidateTransactionsList();
  const invalidateTransactionSummary = useInvalidateTransactionSummary();
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
      onSuccess: async (_data, variables) => {
        await Promise.all([
          invalidateTransactionsList(),
          invalidateTransactionSummary(),
          invalidateTransactionsCategorySummary(),
          invalidateTransaction(variables.transactionId),
        ]);
        addNotification({
          id: `deleteTransactionSuccess-${variables.transactionId}-${Date.now()}`,
          type: "success",
          title: "Операция удалена",
        });
      },
    },
  });

  const deleteTransaction = (transactionId: number) =>
    mutation.mutateAsync({ transactionId });

  return {
    deleteTransaction,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
