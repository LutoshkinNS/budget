import z from "zod";

import type { TransactionCreateDTO } from "@/common/api/generate/model";
import { TransactionsCreateBody } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { useCreateTransaction } from "@/modules/transactions";

export type ExpenseCreateDTO = Omit<TransactionCreateDTO, "type"> &
  Partial<Pick<TransactionCreateDTO, "type">>;

export function useCreateExpense() {
  const { addNotification } = useNotifications();
  const transactionMutation = useCreateTransaction();

  const createExpense = (data: ExpenseCreateDTO) => {
    const validation = TransactionsCreateBody.safeParse({
      ...data,
      type: data.type ?? "expense",
    });

    if (!validation.success) {
      addNotification({
        id: "createExpenseValidation",
        title: "Некорректные данные",
        message: z.prettifyError(validation.error),
      });
      return Promise.reject(validation.error);
    }

    const { date, description, ...rest } = validation.data;

    return transactionMutation.createTransaction({
      ...rest,
      ...(!!date && { date }),
      ...(!!description && { description }),
    });
  };

  return {
    createExpense,
    isLoading: transactionMutation.isLoading,
    isError: transactionMutation.isError,
    error: transactionMutation.error,
  };
}
