import s from "./ExpensesByDays.module.css";

type EmptyStateProps = {
  variant: "empty" | "no-match";
  onReset?: () => void;
};

export function EmptyState({ variant, onReset }: EmptyStateProps) {
  if (variant === "empty") {
    return <div className={s.emptyState}>Нет трат за период</div>;
  }

  return (
    <div className={s.emptyState}>
      <p className={s.emptyStateText}>По выбранным фильтрам трат за период нет</p>
      {onReset && (
        <button type="button" className={s.resetLink} onClick={onReset}>
          показать все
        </button>
      )}
    </div>
  );
}
