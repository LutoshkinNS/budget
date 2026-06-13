import z from "zod";

import { useExpensesUpdate } from "@/common/api/generate/expenses/expenses.gen.ts";
import { ExpensesUpdateBody } from "@/common/api/generate/expenses/expenses.zod.gen.ts";
import type { ExpenseUpdateDTO } from "@/common/api/generate/model";
import { useNotifications } from "@/common/lib/notifications";

import {
  useInvalidateExpense,
  useInvalidateExpensesList,
} from "../useExpenses.ts";

export function useUpdateExpense(expenseId: number) {
  const invalidateExpense = useInvalidateExpense();
  const invalidateExpensesList = useInvalidateExpensesList();
  const { addNotification } = useNotifications();

  const mutation = useExpensesUpdate({
    mutation: {
      onError: (error) => {
        addNotification({
          id: `updateExpenseError-${expenseId}`,
          title: error?.code || "Не удалось сохранить расход",
          message: error?.message,
        });
      },
      onSuccess: async () => {
        await Promise.all([
          invalidateExpensesList(),
          invalidateExpense(expenseId),
        ]);
        addNotification({
          id: `updateExpenseSuccess-${expenseId}-${Date.now()}`,
          type: "success",
          title: "Расход сохранен",
        });
      },
    },
  });

  const updateExpense = (data: ExpenseUpdateDTO) => {
    const normalizedData = {
      ...data,
      description: data.description?.trim() || null,
    };
    const validation = ExpensesUpdateBody.safeParse(normalizedData);

    if (!validation.success) {
      addNotification({
        id: "updateExpenseValidation",
        title: "Некорректные данные",
        message: z.prettifyError(validation.error),
      });
      return Promise.reject(validation.error);
    }

    const updateData: ExpenseUpdateDTO = {
      amount: validation.data.amount,
      categoryId: validation.data.categoryId,
      date: validation.data.date,
      description: validation.data.description ?? null,
    };

    return mutation.mutateAsync({
      expenseId,
      data: updateData,
    });
  };

  return {
    updateExpense,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
