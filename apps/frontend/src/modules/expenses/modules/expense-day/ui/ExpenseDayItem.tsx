import { useNavigate } from "@tanstack/react-router";

import { useCategories } from "@/modules/categories";

import type { ExpenseDTO } from "../../../useExpenses.ts";

import s from "./expenseDay.module.css";

type ExpenseDayItemProps = {
  expense: ExpenseDTO;
  showSignedAmount?: boolean;
};

function formatAmount(expense: ExpenseDTO, showSignedAmount: boolean): string {
  if (!showSignedAmount) {
    return `${expense.amount.toLocaleString("ru")} ₽`;
  }

  const sign = expense.type === "income" ? "+" : "-";
  return `${sign}${expense.amount.toLocaleString("ru")} ₽`;
}

export function ExpenseDayItem({
  expense,
  showSignedAmount = false,
}: ExpenseDayItemProps) {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const categoryName = categories.find((c) => c.id === expense.categoryId)?.name;
  const canEdit = !showSignedAmount || expense.type === "expense";

  return (
    <button
      type="button"
      className={s.expenseItem}
      disabled={!canEdit}
      onClick={
        canEdit
          ? () =>
              navigate({
                to: "/expenses/$expenseId/edit",
                params: { expenseId: String(expense.id) },
              })
          : undefined
      }
    >
      <div className={s.expenseCategory}>
        <span>{categoryName ?? "—"}</span>
        {expense.description && (
          <span className={s.expenseDescription}>{expense.description}</span>
        )}
      </div>
      <span className={s.expenseAmount}>
        {formatAmount(expense, showSignedAmount)}
      </span>
    </button>
  );
}
