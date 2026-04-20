import type { ExpenseDTO } from "@/common/api/generate/model/expenseDTO.gen.ts";
import { useCategories } from "@/modules/categories";

import s from "./expenseDays.module.css";

type ExpenseDayItemProps = {
  expense: ExpenseDTO;
};

export function ExpenseDayItem({ expense }: ExpenseDayItemProps) {
  const { data: categories } = useCategories();
  const categoryName = categories.find((c) => c.id === expense.categoryId)?.name;

  return (
    <div className={s.expenseItem}>
      <div className={s.expenseCategory}>
        <span>{categoryName ?? "—"}</span>
        {expense.description && (
          <span className={s.expenseDescription}>{expense.description}</span>
        )}
      </div>
      <span className={s.expenseAmount}>
        {expense.amount.toLocaleString("ru")} ₽
      </span>
    </div>
  );
}
