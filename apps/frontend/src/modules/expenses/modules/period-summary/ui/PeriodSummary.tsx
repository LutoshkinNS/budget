import clsx from "clsx";

import { useTransactionSummary } from "@/modules/transactions";

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
  period: Period;
  month: string;
  onPeriodChange: (p: Period) => void;
  onMonthChange: (month: string) => void;
};

function formatMoney(value: number, signed = false): string {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ru")} ₽`;
}

export function PeriodSummary({
  range,
  period,
  month,
  onPeriodChange,
  onMonthChange,
}: PeriodSummaryProps) {
  const { data: summary, isLoading } = useTransactionSummary(range);

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
      <div className={s.totals}>
        <div className={s.totalItem}>
          <span className={s.totalLabel}>Доходы</span>
          <span className={s.totalValue}>
            {isLoading || !summary ? "—" : formatMoney(summary.incomeTotal)}
          </span>
        </div>
        <div className={s.totalItem}>
          <span className={s.totalLabel}>Расходы</span>
          <span className={s.totalValue}>
            {isLoading || !summary ? "—" : formatMoney(summary.expenseTotal)}
          </span>
        </div>
        <div className={s.totalItem}>
          <span className={s.totalLabel}>Баланс периода</span>
          <span className={s.totalValue}>
            {isLoading || !summary
              ? "—"
              : formatMoney(summary.periodBalance, true)}
          </span>
        </div>
        <div className={s.totalItem}>
          <span className={s.totalLabel}>Всего накоплено</span>
          <span className={s.totalValue}>
            {isLoading || !summary
              ? "—"
              : formatMoney(summary.totalBalance, true)}
          </span>
        </div>
      </div>
    </div>
  );
}
