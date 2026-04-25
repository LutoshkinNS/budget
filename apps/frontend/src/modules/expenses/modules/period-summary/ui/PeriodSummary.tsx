import { useMemo } from "react";
import clsx from "clsx";

import { Loader } from "@/common/ui/loader/Loader.tsx";

import { useExpenses } from "../../../useExpenses.ts";
import type { Period } from "../model/types.ts";

import s from "./PeriodSummary.module.css";

type PeriodSummaryProps = {
  days: number;
  categoryId: number | null;
  period: Period;
  onPeriodChange: (p: Period) => void;
};

const PERIOD_LABELS: Record<Period, string> = {
  day: "день",
  week: "неделя",
  month: "месяц",
};

const PERIODS: Period[] = ["day", "week", "month"];

export function PeriodSummary({
  days,
  categoryId,
  period,
  onPeriodChange,
}: PeriodSummaryProps) {
  const { groups, isLoading } = useExpenses(days);

  const total = useMemo(() => {
    return groups
      .flatMap((g) => g.expenses)
      .filter((e) => categoryId == null || e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [groups, categoryId]);

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
      <div className={s.amount}>
        {isLoading ? <Loader /> : `${total.toLocaleString("ru")} ₽`}
      </div>
    </div>
  );
}
