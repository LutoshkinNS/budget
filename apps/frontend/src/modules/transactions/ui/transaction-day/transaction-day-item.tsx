import type { TransactionDTO } from "@/common/api/generate/model";
import { CategoryIcon, useCategories } from "@/modules/categories";

import { useDeleteTransaction } from "../../model/use-delete-transaction.ts";

import s from "./transaction-day.module.css";

type TransactionDayItemProps = {
  transaction: TransactionDTO;
  onEdit: (transactionId: number) => void;
};

function formatAmount(transaction: TransactionDTO): string {
  const sign = transaction.type === "income" ? "+" : "-";
  return `${sign}${transaction.amount.toLocaleString("ru")} ₽`;
}

export function TransactionDayItem({
  transaction,
  onEdit,
}: TransactionDayItemProps) {
  const { data: categories } = useCategories();
  const category = categories.find((c) => c.id === transaction.categoryId);
  const { deleteTransaction, pendingTransactionId } = useDeleteTransaction();
  // Ожидание удаления ограничено строкой: соседние действия остаются доступны.
  const isDeleting = pendingTransactionId === transaction.id;
  const deleteLabel =
    transaction.type === "income" ? "Удалить доход" : "Удалить расход";

  const handleEdit = () => {
    onEdit(transaction.id);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(deleteLabel + "?");

    if (!confirmed) return;

    await deleteTransaction(transaction.id);
  };

  return (
    <div className={s.transactionItem}>
      <button
        type="button"
        className={s.transactionMain}
        disabled={isDeleting}
        onClick={handleEdit}
      >
        <div className={s.transactionCategory}>
          <span className={s.transactionCategoryName}>
            <CategoryIcon iconKey={category?.iconKey} />
            <span>{category?.name ?? "—"}</span>
          </span>
          {transaction.description && (
            <span className={s.transactionDescription}>
              {transaction.description}
            </span>
          )}
        </div>
        <span className={s.transactionAmount}>{formatAmount(transaction)}</span>
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
