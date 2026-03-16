import { CategoriesSelect } from "@/modules/categories";
import { CreateExpense, ExpenseList } from "@/modules/expenses";

export function Main() {
  return (
    <>
      <CreateExpense CategoriesSlot={<CategoriesSelect />} />
      <ExpenseList />
    </>
  );
}
