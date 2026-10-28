import clsx from "clsx";

import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import {
  getCurrentMonthValue,
  type Period,
  PERIOD_LABELS,
  type PeriodDateRange,
  PERIODS,
} from "../../model/period.ts";
import { useTransactionSummary } from "../../model/use-transactions.ts";

import s from "./period-summary.module.css";

type PeriodSummaryProps = {
  range: PeriodDateRange;
  period: Period;
  month: string;
  onPeriodChange: (p: Period) => void;
  onMonthChange: (month: string) => void;
};

function formatMoney(value: number, signed = false): string {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ru")} ₽`;
}

const SUMMARY_LABELS = [
  "Доходы периода",
  "Расходы периода",
  "Баланс периода",
  "Текущий баланс",
] as const;

export function PeriodSummary({
  range,
  period,
  month,
  onPeriodChange,
  onMonthChange,
}: PeriodSummaryProps) {
  const {
    data: summary,
    hasAccount,
    isError,
    isLoading,
  } = useTransactionSummary(range);

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
      {!hasAccount && (
        <p className={s.errorState} role="alert">
          Счёт не выбран
        </p>
      )}
      {isError && summary && (
        <p className={s.errorState} role="alert">
          Не удалось обновить итоги
        </p>
      )}
      {isError && !summary && hasAccount && (
        <p className={s.errorState} role="alert">
          Не удалось загрузить итоги
        </p>
      )}
      <div
        className={s.totals}
        {...(isLoading
          ? { role: "status" as const, "aria-label": "Загрузка итогов" }
          : {})}
      >
        {isLoading ? (
          SUMMARY_LABELS.map((label) => (
            <div className={s.totalItem} key={label}>
              <span className={s.totalLabel}>{label}</span>
              <Skeleton
                {...(s.totalSkeleton ? { className: s.totalSkeleton } : {})}
              />
            </div>
          ))
        ) : (
          <>
            <div className={s.totalItem}>
              <span className={s.totalLabel}>Доходы периода</span>
              <span className={s.totalValue}>
                {!summary ? "—" : formatMoney(summary.incomeTotal)}
              </span>
            </div>
            <div className={s.totalItem}>
              <span className={s.totalLabel}>Расходы периода</span>
              <span className={s.totalValue}>
                {!summary ? "—" : formatMoney(summary.expenseTotal)}
              </span>
            </div>
            <div className={s.totalItem}>
              <span className={s.totalLabel}>Баланс периода</span>
              <span className={s.totalValue}>
                {!summary ? "—" : formatMoney(summary.periodBalance, true)}
              </span>
            </div>
            <div className={s.totalItem}>
              <span className={s.totalLabel}>Текущий баланс</span>
              <span className={s.totalValue}>
                {!summary ? "—" : formatMoney(summary.totalBalance)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
