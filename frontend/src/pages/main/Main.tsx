import { CategoriesSelect } from "@/features/categories";
import { CreateExpense, ExpenseList } from "@/features/expenses";

export function Main() {
  return (
    <>
      <CreateExpense CategoriesSlot={<CategoriesSelect />} />
      <ExpenseList />
    </>
  );
}
