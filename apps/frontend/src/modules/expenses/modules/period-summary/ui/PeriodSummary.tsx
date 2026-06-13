import { useMemo } from "react";
import clsx from "clsx";

import { useExpenses } from "../../../useExpenses.ts";
import {
  type ExpenseDateRange,
  getCurrentMonthValue,
  type Period,
  PERIOD_LABELS,
  PERIODS,
} from "../model/types.ts";

import s from "./PeriodSummary.module.css";

type PeriodSummaryProps = {
  range: ExpenseDateRange;
  categoryId: number | null;
  userId: number | null;
  period: Period;
  month: string;
  onPeriodChange: (p: Period) => void;
  onMonthChange: (month: string) => void;
};

export function PeriodSummary({
  range,
  categoryId,
  userId,
  period,
  month,
  onPeriodChange,
  onMonthChange,
}: PeriodSummaryProps) {
  const { groups, isLoading } = useExpenses(range);

  const total = useMemo(() => {
    return groups
      .flatMap((g) => g.expenses)
      .filter((e) => categoryId == null || e.categoryId === categoryId)
      .filter((e) => userId == null || e.userId === userId)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [groups, categoryId, userId]);

  return (
    <div className={s.summary}>
      <div className={s.switcher} role="tablist">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={p === period}
            className={clsx(s.switchBtn, p === period && s.switchBtnActive)}
            onClick={() => onPeriodChange(p)}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
      {period === "month" && (
        <input
          className={s.monthInput}
          type="month"
          value={month}
          max={getCurrentMonthValue()}
          aria-label="Месяц"
          onChange={(event) => onMonthChange(event.target.value)}
        />
      )}
      <div className={s.amount}>
        {isLoading ? "—" : `${total.toLocaleString("ru")} ₽`}
      </div>
    </div>
  );
}
