import { useMemo } from "react";

import { Loader } from "@/common/ui/loader/Loader.tsx";

import {
  getTransactionDateRange,
  type PeriodDateRange,
} from "../../model/period.ts";
import { useTransactions } from "../../model/useTransactions.ts";
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
  const { groups, isLoading } = useTransactions(transactionRange);

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

  if (isLoading) return <Loader />;

  if (filtered.length === 0) {
    const variant = categoryId == null && userId == null ? "empty" : "no-match";
    const resetProps = pickResetHandler({
      categoryId,
      userId,
      ...(onResetCategory ? { onResetCategory } : {}),
      ...(onResetUser ? { onResetUser } : {}),
    });
    return <EmptyState variant={variant} {...resetProps} />;
  }

  return (
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
  );
}
