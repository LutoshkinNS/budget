import clsx from "clsx";

import s from "./transaction-day.module.css";

type TransactionDayHeaderProps = {
  label: string;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
};

function formatAmount(amount: number): string {
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toLocaleString("ru")} ₽`;
}

export function TransactionDayHeader({
  label,
  total,
  isExpanded,
  onToggle,
}: TransactionDayHeaderProps) {
  return (
    <div className={s.dayHeader} onClick={onToggle}>
      <span className={s.dayLabel}>{label}</span>
      <div className={s.daySumRow}>
        <span className={s.dayTotal}>{formatAmount(total)}</span>
        <svg
          className={clsx(s.arrow, !isExpanded && s.arrowCollapsed)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
}
