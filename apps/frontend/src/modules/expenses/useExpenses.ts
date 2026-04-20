import { useEffect } from "react";

import { queryClient } from "@/common/api/appQuery";
import {
  getExpensesListQueryKey,
  useExpensesList,
} from "@/common/api/generate/expenses/expenses.gen.ts";
import type { ExpenseDTO } from "@/common/api/generate/model/expenseDTO.gen.ts";
import { ExpensesListResponse } from "@/common/api/generate/expenses/expenses.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

const DAYS_TO_SHOW = 2;

export type ExpenseDayGroup = {
  label: string;
  isoDate: string;
  total: number;
  expenses: ExpenseDTO[];
};

function toIsoDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayLabel(isoDate: string): string {
  const today = toIsoDate(new Date().toISOString());
  const yesterday = toIsoDate(
    new Date(Date.now() - 86400000).toISOString(),
  );
  if (isoDate === today) return "сегодня";
  if (isoDate === yesterday) return "вчера";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function groupByDay(expenses: ExpenseDTO[]): ExpenseDayGroup[] {
  const map = new Map<string, ExpenseDTO[]>();
  for (const expense of expenses) {
    const key = toIsoDate(expense.date);
    const group = map.get(key) ?? [];
    group.push(expense);
    map.set(key, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([isoDate, items]) => ({
      isoDate,
      label: getDayLabel(isoDate),
      total: items.reduce((sum, e) => sum + e.amount, 0),
      expenses: items,
    }));
}

export function useExpenses() {
  const { data, isError, error, isLoading } = useExpensesList({
    days: DAYS_TO_SHOW,
  });
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
      const validation = ExpensesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useExpenseValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = ExpensesListResponse.safeParse(data);
  const groups = validation.success && data ? groupByDay(data) : [];

  return { groups, isLoading };
}

export function useInvalidateExpensesList() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: getExpensesListQueryKey(),
    });
}
