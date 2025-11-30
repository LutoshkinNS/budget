import { useExpensesCreate } from "@/kernel/api/generate/expenses/expenses.gen.ts";
import { ExpenseCreateDTO } from "@/kernel/api/generate/model";

export function useCreateExpense() {
  const mutation = useExpensesCreate();

  const createExpense = (data: ExpenseCreateDTO) => {
    return mutation.mutateAsync({ data });
  };

  return {
    createExpense,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
