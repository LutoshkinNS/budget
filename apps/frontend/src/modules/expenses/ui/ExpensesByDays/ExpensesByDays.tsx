import { useMemo } from "react";

import { Loader } from "@/common/ui/loader/Loader.tsx";
import { useTransactions } from "@/modules/transactions";

import { ExpenseDayGroup } from "../../modules/expense-day";
import {
  type ExpenseDateRange,
  getExpenseDateRange,
} from "../../modules/period-summary";

import { EmptyState } from "./EmptyState.tsx";

import s from "./ExpensesByDays.module.css";

type ExpensesByDaysProps = {
  mode?: "expenses" | "transactions";
  range?: ExpenseDateRange;
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

export function ExpensesByDays({
  mode = "expenses",
  range,
  categoryId = null,
  userId = null,
  onResetCategory,
  onResetUser,
}: ExpensesByDaysProps = {}) {
  const transactionRange = range ?? getExpenseDateRange("day");
  const { groups, isLoading } = useTransactions({
    ...transactionRange,
    ...(mode === "expenses" ? { type: "expense" as const } : {}),
  });
  const showSignedAmounts = mode === "transactions";

  const filtered = useMemo(() => {
    if (categoryId == null && userId == null && !showSignedAmounts) {
      return groups;
    }
    return groups
      .map((g) => {
        const transactions = g.transactions.filter(
          (e) =>
            (categoryId == null || e.categoryId === categoryId) &&
            (userId == null || e.userId === userId),
        );
        const total = transactions.reduce(
          (sum, e) =>
            sum +
            (showSignedAmounts && e.type === "expense" ? -e.amount : e.amount),
          0,
        );
        return { ...g, transactions, total };
      })
      .filter((g) => g.transactions.length > 0);
  }, [groups, categoryId, userId, showSignedAmounts]);

  if (isLoading) return <Loader />;

  if (filtered.length === 0) {
    const variant =
      categoryId == null && userId == null ? "empty" : "no-match";
    const resetProps = pickResetHandler({
      categoryId,
      userId,
      ...(onResetCategory ? { onResetCategory } : {}),
      ...(onResetUser ? { onResetUser } : {}),
    });
    return <EmptyState variant={variant} subject={mode} {...resetProps} />;
  }

  return (
    <div className={s.container}>
      {filtered.map((group) => (
        <ExpenseDayGroup
          key={group.isoDate}
          label={group.label}
          total={group.total}
          expenses={group.transactions}
          showSignedAmounts={showSignedAmounts}
        />
      ))}
    </div>
  );
}
