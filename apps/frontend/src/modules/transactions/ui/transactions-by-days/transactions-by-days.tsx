import { useMemo } from "react";

import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import {
  getTransactionDateRange,
  type PeriodDateRange,
} from "../../model/period.ts";
import { useTransactions } from "../../model/use-transactions.ts";
import { TransactionDayGroup } from "../transaction-day/transaction-day-group.tsx";

import { EmptyState } from "./empty-state.tsx";

import s from "./transactions-by-days.module.css";

type TransactionsByDaysProps = {
  onEdit: (transactionId: number) => void;
  range?: PeriodDateRange;
  categoryId?: number | null;
  userId?: number | null;
  onResetCategory?: () => void;
  onResetUser?: () => void;
};

function pickResetHandler(args: {
  categoryId: number | null;
  userId: number | null;
  onResetCategory?: () => void;
  onResetUser?: () => void;
}): Partial<{ onReset: () => void }> {
  const { categoryId, userId, onResetCategory, onResetUser } = args;
  if (categoryId != null && userId == null && onResetCategory) {
    return { onReset: onResetCategory };
  }
  if (userId != null && categoryId == null && onResetUser) {
    return { onReset: onResetUser };
  }
  return {};
}

export function TransactionsByDays({
  onEdit,
  range,
  categoryId = null,
  userId = null,
  onResetCategory,
  onResetUser,
}: TransactionsByDaysProps) {
  const transactionRange = range ?? getTransactionDateRange("day");
  const { groups, refetch, hasAccount, hasValidData, isError, isLoading } =
    useTransactions(transactionRange);

  const filtered = useMemo(() => {
    return groups
      .map((g) => {
        const transactions = g.transactions.filter(
          (e) =>
            (categoryId == null || e.categoryId === categoryId) &&
            (userId == null || e.userId === userId),
        );
        const total = transactions.reduce(
          (sum, e) => sum + (e.type === "expense" ? -e.amount : e.amount),
          0,
        );
        return { ...g, transactions, total };
      })
      .filter((g) => g.transactions.length > 0);
  }, [groups, categoryId, userId]);

  if (!hasAccount) {
    return <p className={s.emptyStateText}>Счёт не выбран</p>;
  }

  if (isLoading) {
    return (
      <div className={s.loading} role="status" aria-label="Загрузка операций">
        {[0, 1, 2].map((group) => (
          <div className={s.loadingGroup} key={group}>
            <Skeleton
              {...(s.loadingDate ? { className: s.loadingDate } : {})}
            />
            {[0, 1].map((row) => (
              <Skeleton
                {...(s.loadingRow ? { className: s.loadingRow } : {})}
                key={row}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const errorState = isError ? (
    <div className={s.errorState} role="alert">
      <p className={s.errorStateText}>
        {hasValidData
          ? "Не удалось обновить операции"
          : "Не удалось загрузить операции"}
      </p>
      <button
        type="button"
        className={s.retryLink}
        onClick={() => {
          void refetch();
        }}
      >
        Повторить
      </button>
    </div>
  ) : null;

  if (filtered.length === 0) {
    if (isError && !hasValidData) return errorState;

    const variant = categoryId == null && userId == null ? "empty" : "no-match";
    const resetProps = pickResetHandler({
      categoryId,
      userId,
      ...(onResetCategory ? { onResetCategory } : {}),
      ...(onResetUser ? { onResetUser } : {}),
    });
    return (
      <>
        {errorState}
        <EmptyState variant={variant} {...resetProps} />
      </>
    );
  }

  return (
    <>
      {errorState}
      <div className={s.container}>
        {filtered.map((group) => (
          <TransactionDayGroup
            key={group.isoDate}
            label={group.label}
            total={group.total}
            transactions={group.transactions}
            onEdit={onEdit}
          />
        ))}
      </div>
    </>
  );
}
