import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";

import {
  formatCategoryShare,
  formatMoney,
  formatPeriodChange,
} from "../../../model/formatters.ts";
import type { ReportsPeriodRange } from "../../../model/period.ts";
import {
  type ReportsCategory,
  type ReportsTransactionType,
  useReportsCategoryTransactions,
} from "../../../model/use-category-analytics.ts";

import { Operations } from "./operations.tsx";

import s from "./category-detail-sheet.module.css";

export type CategoryDetailSheetProps = {
  category: ReportsCategory | null;
  from: ReportsPeriodRange["from"];
  to: ReportsPeriodRange["to"];
  reportType: ReportsTransactionType;
  onClose: () => void;
};

export function CategoryDetailSheet({
  category,
  from,
  to,
  reportType,
  onClose,
}: CategoryDetailSheetProps) {
  const operationsQuery = useReportsCategoryTransactions({
    categoryId: category?.categoryId ?? null,
    from,
    to,
    type: reportType,
  });

  if (!category) return null;

  return (
    <div className={s.sheetOverlay} role="presentation" onClick={onClose}>
      <section
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-sheet-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={s.sheetHandle} />
        <div className={s.sheetHeader}>
          <div>
            <h2 id="category-sheet-title">{category.categoryName}</h2>
            <p>
              {formatMoney(category.amount)} ·{" "}
              {formatCategoryShare(category.percentage, reportType)} ·{" "}
              {category.transactionCount} операций
            </p>
          </div>
          <button
            type="button"
            className={s.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
            autoFocus
          >
            ×
          </button>
        </div>
        <p className={s.sheetChange}>
          {formatPeriodChange(category.changePercent)}
        </p>
        <h3>Операции</h3>
        {operationsQuery.isError ? (
          <SimpleError>Не удалось загрузить операции.</SimpleError>
        ) : (
          <Operations
            transactions={operationsQuery.transactions}
            isLoading={operationsQuery.isLoading}
          />
        )}
      </section>
    </div>
  );
}
