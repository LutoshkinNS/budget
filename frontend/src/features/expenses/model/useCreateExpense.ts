import { useExpensesCreate } from "@/kernel/api/generate/expenses/expenses.ts";
import type { ExpenseCreate } from "@/kernel/api/generate/model";

export function useCreateExpense() {
  const mutation = useExpensesCreate();

  const createExpense = (data: ExpenseCreate) => {
    return mutation.mutateAsync({ data });
  };

  return {
    createExpense,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
