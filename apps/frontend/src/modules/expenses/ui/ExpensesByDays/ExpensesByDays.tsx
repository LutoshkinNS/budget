import { useMemo } from "react";

import { Loader } from "@/common/ui/loader/Loader.tsx";

import { ExpenseDayGroup } from "../../modules/expense-day";
import type { ExpenseDateRange } from "../../modules/period-summary";
import { useExpenses } from "../../useExpenses.ts";

import { EmptyState } from "./EmptyState.tsx";

import s from "./ExpensesByDays.module.css";

type ExpensesByDaysProps = {
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
  range,
  categoryId = null,
  userId = null,
  onResetCategory,
  onResetUser,
}: ExpensesByDaysProps = {}) {
  const { groups, isLoading } = useExpenses(range);

  const filtered = useMemo(() => {
    if (categoryId == null && userId == null) return groups;
    return groups
      .map((g) => {
        const expenses = g.expenses.filter(
          (e) =>
            (categoryId == null || e.categoryId === categoryId) &&
            (userId == null || e.userId === userId),
        );
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        return { ...g, expenses, total };
      })
      .filter((g) => g.expenses.length > 0);
  }, [groups, categoryId, userId]);

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
    return <EmptyState variant={variant} {...resetProps} />;
  }

  return (
    <div className={s.container}>
      {filtered.map((group) => (
        <ExpenseDayGroup
          key={group.isoDate}
          label={group.label}
          total={group.total}
          expenses={group.expenses}
        />
      ))}
    </div>
  );
}
