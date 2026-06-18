import z from "zod";

import type { TransactionUpdateDTO } from "@/common/api/generate/model";
import { TransactionsUpdateBody } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { useUpdateTransaction } from "@/modules/transactions";

export type ExpenseUpdateDTO = Omit<TransactionUpdateDTO, "type"> &
  Partial<Pick<TransactionUpdateDTO, "type">>;

export function useUpdateExpense(expenseId: number) {
  const { addNotification } = useNotifications();
  const mutation = useUpdateTransaction(expenseId);

  const updateExpense = (data: ExpenseUpdateDTO) => {
    const normalizedData = {
      ...data,
      type: data.type ?? "expense",
      description: data.description?.trim() || null,
    };
    const validation = TransactionsUpdateBody.safeParse(normalizedData);

    if (!validation.success) {
      addNotification({
        id: "updateExpenseValidation",
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

    return mutation.updateTransaction(updateData);
  };

  return {
    updateExpense,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
  };
}
