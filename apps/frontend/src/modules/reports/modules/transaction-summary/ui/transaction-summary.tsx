import { formatMoney, formatPeriodChange } from "../../../model/formatters.ts";
import type {
  ReportsCategorySummary,
  ReportsTransactionType,
} from "../../../model/use-category-analytics.ts";

import s from "./transaction-summary.module.css";

export type TransactionSummaryProps = {
  summary: Pick<
    ReportsCategorySummary,
    "totalAmount" | "changePercent" | "transactionCount"
  >;
  reportType: ReportsTransactionType;
};

export function TransactionSummary({
  summary,
  reportType,
}: TransactionSummaryProps) {
  const label = reportType === "expense" ? "Расходы" : "Доходы";

  return (
    <section className={s.summary} aria-label={`Сводка: ${label}`}>
      <span>{label}</span>
      <strong>{formatMoney(summary.totalAmount)}</strong>
      <div>
        <span>{formatPeriodChange(summary.changePercent)}</span>
        <span>{summary.transactionCount} операций</span>
      </div>
    </section>
  );
}
