import { formatMoney, formatPeriodChange } from "../../../model/formatters.ts";
import type { ReportsCategorySummary } from "../../../model/use-category-analytics.ts";

import s from "./expense-summary.module.css";

export type ExpenseSummaryProps = {
  summary: Pick<
    ReportsCategorySummary,
    "totalExpense" | "changePercent" | "transactionCount"
  >;
};

export function ExpenseSummary({ summary }: ExpenseSummaryProps) {
  return (
    <section className={s.summary} aria-label="Сводка расходов">
      <span>Расходы</span>
      <strong>{formatMoney(summary.totalExpense)}</strong>
      <div>
        <span>{formatPeriodChange(summary.changePercent)}</span>
        <span>{summary.transactionCount} операций</span>
      </div>
    </section>
  );
}
