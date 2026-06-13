import { useNavigate } from "@tanstack/react-router";

import type { ExpenseDTO } from "@/common/api/generate/model/expenseDTO.gen.ts";
import { useCategories } from "@/modules/categories";

import s from "./expenseDay.module.css";

type ExpenseDayItemProps = {
  expense: ExpenseDTO;
};

export function ExpenseDayItem({ expense }: ExpenseDayItemProps) {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const categoryName = categories.find((c) => c.id === expense.categoryId)?.name;

  return (
    <button
      type="button"
      className={s.expenseItem}
      onClick={() =>
        navigate({
          to: "/expenses/$expenseId/edit",
          params: { expenseId: String(expense.id) },
        })
      }
    >
      <div className={s.expenseCategory}>
        <span>{categoryName ?? "—"}</span>
        {expense.description && (
          <span className={s.expenseDescription}>{expense.description}</span>
        )}
      </div>
      <span className={s.expenseAmount}>
        {expense.amount.toLocaleString("ru")} ₽
      </span>
    </button>
  );
}
