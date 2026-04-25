import { useMemo } from "react";

import { Loader } from "@/common/ui/loader/Loader.tsx";

import { ExpenseDayGroup } from "../../modules/expense-day";
import { useExpenses } from "../../useExpenses.ts";

import { EmptyState } from "./EmptyState.tsx";

import s from "./ExpensesByDays.module.css";

type ExpensesByDaysProps = {
  days?: number;
  categoryId?: number | null;
  onResetCategory?: () => void;
};

export function ExpensesByDays({
  days,
  categoryId = null,
  onResetCategory,
}: ExpensesByDaysProps = {}) {
  const { groups, isLoading } = useExpenses(days);

  const filtered = useMemo(() => {
    if (categoryId == null) return groups;
    return groups
      .map((g) => {
        const expenses = g.expenses.filter((e) => e.categoryId === categoryId);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        return { ...g, expenses, total };
      })
      .filter((g) => g.expenses.length > 0);
  }, [groups, categoryId]);

  if (isLoading) return <Loader />;

  if (filtered.length === 0) {
    return (
      <EmptyState
        variant={categoryId == null ? "empty" : "no-match"}
        {...(categoryId != null && onResetCategory
          ? { onReset: onResetCategory }
          : {})}
      />
    );
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
