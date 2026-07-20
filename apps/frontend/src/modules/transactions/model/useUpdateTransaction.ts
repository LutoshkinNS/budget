import z from "zod";

import type { TransactionUpdateDTO } from "@/common/api/generate/model";
import { useTransactionsUpdate } from "@/common/api/generate/transactions/transactions.gen.ts";
import { TransactionsUpdateBody } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import {
  useInvalidateTransaction,
  useInvalidateTransactionsCategorySummary,
  useInvalidateTransactionsList,
  useInvalidateTransactionSummary,
} from "./useTransactions.ts";

export function useUpdateTransaction(transactionId: number) {
  const invalidateTransaction = useInvalidateTransaction();
  const invalidateTransactionsCategorySummary =
    useInvalidateTransactionsCategorySummary();
  const invalidateTransactionsList = useInvalidateTransactionsList();
  const invalidateTransactionSummary = useInvalidateTransactionSummary();
  const { addNotification } = useNotifications();

  const mutation = useTransactionsUpdate({
    mutation: {
      onError: (error) => {
        addNotification({
          id: `updateTransactionError-${transactionId}`,
          title: error?.code || "Не удалось сохранить операцию",
          message: error?.message,
        });
      },
      onSuccess: async () => {
        await Promise.all([
          invalidateTransactionsList(),
          invalidateTransactionSummary(),
          invalidateTransactionsCategorySummary(),
          invalidateTransaction(transactionId),
        ]);
        addNotification({
          id: `updateTransactionSuccess-${transactionId}-${Date.now()}`,
          type: "success",
          title: "Операция сохранена",
        });
      },
    },
  });

  const updateTransaction = (data: TransactionUpdateDTO) => {
    const normalizedData = {
      ...data,
      description: data.description?.trim() || null,
    };
    const validation = TransactionsUpdateBody.safeParse(normalizedData);

    if (!validation.success) {
      addNotification({
        id: "updateTransactionValidation",
        title: "Некорректные данные",
        message: z.prettifyError(validation.error),
      });
      return Promise.reject(validation.error);
    }

    const updateData: TransactionUpdateDTO = {
      amount: validation.data.amount,
      categoryId: validation.data.categoryId,
      date: validation.data.date,
      description: validation.data.description ?? null,
      type: validation.data.type,
    };

    return mutation.mutateAsync({
      transactionId,
      data: updateData,
    });
  };

  return {
    updateTransaction,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
