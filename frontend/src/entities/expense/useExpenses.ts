import { useEffect } from "react";

import { queryClient } from "@/kernel/api/appQuery";
import {
  getExpensesListQueryKey,
  useExpensesList,
} from "@/kernel/api/generate/expenses/expenses.gen.ts";
import { expensesListResponse } from "@/kernel/api/generate/expenses/expenses.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

export function useExpenses() {
  const { data, isError, error } = useExpensesList();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useExpenseError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = expensesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useExpenseValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = expensesListResponse.safeParse(data);
  if (validation.success && data) {
    const sortedData = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return { data: sortedData };
  } else {
    return { data: [] };
  }
}

export function useInvalidateExpensesList() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: getExpensesListQueryKey(),
    });
}
