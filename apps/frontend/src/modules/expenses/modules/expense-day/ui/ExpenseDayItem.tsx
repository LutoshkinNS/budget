import { useNavigate } from "@tanstack/react-router";

import { useCategories } from "@/modules/categories";
import { useDeleteTransaction } from "@/modules/transactions";

import type { ExpenseDTO } from "../../../model/useExpenses.ts";

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
  const categoryName = categories.find(
    (c) => c.id === expense.categoryId,
  )?.name;
  const { deleteTransaction, isLoading: isDeleting } = useDeleteTransaction();
  const canEdit = expense.type === "expense";
  const deleteLabel =
    expense.type === "income" ? "Удалить доход" : "Удалить расход";

  const handleEdit = () => {
    if (!canEdit) return;

    navigate({
      to: "/expenses/$expenseId/edit",
      params: { expenseId: String(expense.id) },
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(deleteLabel + "?");

    if (!confirmed) return;

    await deleteTransaction(expense.id);
  };

  return (
    <div className={s.expenseItem}>
      <button
        type="button"
        className={s.expenseMain}
        disabled={!canEdit}
        onClick={handleEdit}
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
      <button
        type="button"
        className={s.deleteButton}
        aria-label={deleteLabel}
        disabled={isDeleting}
        onClick={handleDelete}
      >
        ×
      </button>
    </div>
  );
}
