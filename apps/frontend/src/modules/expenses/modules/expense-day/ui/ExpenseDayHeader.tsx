import clsx from "clsx";

import s from "./expenseDay.module.css";

type ExpenseDayHeaderProps = {
  label: string;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ExpenseDayHeader({ label, total, isExpanded, onToggle }: ExpenseDayHeaderProps) {
  return (
    <div className={s.dayHeader} onClick={onToggle}>
      <span className={s.dayLabel}>{label}</span>
      <div className={s.daySumRow}>
        <span className={s.dayTotal}>
          {total.toLocaleString("ru")} ₽
        </span>
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
