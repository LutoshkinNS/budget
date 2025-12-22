import z from "zod";

import { useInvalidateExpensesList } from "@/entities/expense";
import { useExpensesCreate } from "@/kernel/api/generate/expenses/expenses.gen.ts";
import { expensesCreateBody } from "@/kernel/api/generate/expenses/expenses.zod.gen.ts";
import { ExpenseCreateDTO } from "@/kernel/api/generate/model";
import { useNotifications } from "@/shared/lib/notifications";

export function useCreateExpense() {
  const invalidateExpensesList = useInvalidateExpensesList();
  const { addNotification } = useNotifications();

  const mutation = useExpensesCreate({
    mutation: {
      onError: () => {},
      onSuccess: async () => {
        await invalidateExpensesList();
      },
    },
  });

  const createExpense = (data: ExpenseCreateDTO) => {
    const validation = expensesCreateBody.safeParse(data);

    if (!validation.success) {
      addNotification({
        id: "createExpenseValidation",
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
    createExpense,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
