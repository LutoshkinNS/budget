import s from "./ExpensesByDays.module.css";

type EmptyStateProps = {
  variant: "empty" | "no-match";
  subject?: "expenses" | "transactions";
  onReset?: () => void;
};

const EMPTY_TEXT: Record<NonNullable<EmptyStateProps["subject"]>, string> = {
  expenses: "Нет трат за период",
  transactions: "Нет операций за период",
};

const NO_MATCH_TEXT: Record<NonNullable<EmptyStateProps["subject"]>, string> = {
  expenses: "По выбранным фильтрам трат за период нет",
  transactions: "По выбранным фильтрам операций за период нет",
};

export function EmptyState({
  variant,
  subject = "expenses",
  onReset,
}: EmptyStateProps) {
  if (variant === "empty") {
    return <div className={s.emptyState}>{EMPTY_TEXT[subject]}</div>;
  }

  return (
    <div className={s.emptyState}>
      <p className={s.emptyStateText}>{NO_MATCH_TEXT[subject]}</p>
      {onReset && (
        <button type="button" className={s.resetLink} onClick={onReset}>
          показать все
        </button>
      )}
    </div>
  );
}
