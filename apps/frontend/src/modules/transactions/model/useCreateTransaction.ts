import z from "zod";

import type { TransactionCreateDTO } from "@/common/api/generate/model";
import { useTransactionsCreate } from "@/common/api/generate/transactions/transactions.gen.ts";
import { TransactionsCreateBody } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import {
  useInvalidateTransactionsCategorySummary,
  useInvalidateTransactionsList,
  useInvalidateTransactionSummary,
} from "./useTransactions.ts";

export function useCreateTransaction() {
  const invalidateTransactionsCategorySummary =
    useInvalidateTransactionsCategorySummary();
  const invalidateTransactionsList = useInvalidateTransactionsList();
  const invalidateTransactionSummary = useInvalidateTransactionSummary();
  const { addNotification } = useNotifications();

  const mutation = useTransactionsCreate({
    mutation: {
      onError: () => {},
      onSuccess: async () => {
        await Promise.all([
          invalidateTransactionsList(),
          invalidateTransactionSummary(),
          invalidateTransactionsCategorySummary(),
        ]);
      },
    },
  });

  const createTransaction = (data: TransactionCreateDTO) => {
    const validation = TransactionsCreateBody.safeParse(data);

    if (!validation.success) {
      addNotification({
        id: "createTransactionValidation",
        title: "Некорректные данные",
        message: z.prettifyError(validation.error),
      });
      return Promise.reject(validation.error);
    }

    const { date, description, ...rest } = validation.data;

    return mutation.mutateAsync({
      data: {
        ...rest,
        ...(!!date && { date }),
        ...(!!description && { description }),
      },
    });
  };

  return {
    createTransaction,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
