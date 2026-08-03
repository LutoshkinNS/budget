import type { ReportsTransactionType } from "../../../model/use-category-analytics.ts";

import s from "./report-type-controls.module.css";

const REPORT_TYPE_TABS = [
  { type: "expense", label: "Расходы" },
  { type: "income", label: "Доходы" },
] as const satisfies ReadonlyArray<{
  type: ReportsTransactionType;
  label: string;
}>;

export type ReportTypeControlsProps = {
  reportType: ReportsTransactionType;
  onReportTypeChange: (type: ReportsTransactionType) => void;
};

export function ReportTypeControls({
  reportType,
  onReportTypeChange,
}: ReportTypeControlsProps) {
  return (
    <section className={s.typeSection} aria-label="Тип отчёта">
      <div className={s.typeTabs} role="tablist" aria-label="Тип операций">
        {REPORT_TYPE_TABS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={reportType === type}
            className={reportType === type ? s.typeTabActive : s.typeTab}
            onClick={() => onReportTypeChange(type)}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
