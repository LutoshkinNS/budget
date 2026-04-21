import { makeLazy } from "@/common/ui/makeLazy";
import { CreateExpense } from "@/modules/expenses";

const ExpensesByDays = makeLazy(
  () => import("@/modules/expenses/ui/ExpensesByDays"),
  "ExpensesByDays",
);

export function Main() {
  return (
    <>
      <CreateExpense />
      <ExpensesByDays />
    </>
  );
}
