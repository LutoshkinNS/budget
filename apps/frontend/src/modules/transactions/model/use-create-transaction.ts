import z from "zod";

import type { TransactionCreateDTO } from "@/common/api/generate/model";
import { useTransactionsCreate } from "@/common/api/generate/transactions/transactions.gen.ts";
import { TransactionsCreateBody } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { invalidateCategories } from "@/modules/categories";
import { requireCurrentAccountId } from "@/modules/user";

import {
  invalidateTransactionsCategorySummary,
  invalidateTransactionsList,
  invalidateTransactionSummary,
} from "./transaction-cache.ts";

export function useCreateTransaction() {
  const { addNotification } = useNotifications();

  const mutation = useTransactionsCreate({
    mutation: {
      onError: () => {},
      // Поздний ответ инвалидирует кэш счёта из variables вызова.
      onSuccess: async (_data, variables) => {
        const accountId = variables.accountId;
        await Promise.all([
          invalidateTransactionsList(accountId),
          invalidateTransactionSummary(accountId),
          invalidateTransactionsCategorySummary(accountId),
          invalidateCategories(accountId),
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
      accountId: requireCurrentAccountId(),
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
