import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";
import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import {
  buildReportsPeriodRanges,
  type ReportsPeriodSelection,
} from "../model/period.ts";
import {
  type ReportsCategory,
  type ReportsTransactionType,
  useReportsCategorySummary,
} from "../model/use-category-analytics.ts";
import { CategoryDetailSheet } from "../modules/category-detail-sheet";
import { CategoryList } from "../modules/category-list";
import { PeriodControls } from "../modules/period-controls";
import { ReportTypeControls } from "../modules/report-type-controls";
import { TransactionSummary } from "../modules/transaction-summary";

import s from "./reports-screen.module.css";

type ReportsScreenProps = {
  periodSelection: ReportsPeriodSelection;
  reportType: ReportsTransactionType;
  selectedCategoryId: ReportsCategory["categoryId"] | undefined;
  onPeriodSelectionChange: (periodSelection: ReportsPeriodSelection) => void;
  onReportTypeChange: (type: ReportsTransactionType) => void;
  onCategorySelect: (categoryId: ReportsCategory["categoryId"]) => void;
  onCategoryClose: () => void;
};

export function ReportsScreen({
  periodSelection,
  reportType,
  selectedCategoryId,
  onPeriodSelectionChange,
  onReportTypeChange,
  onCategorySelect,
  onCategoryClose,
}: ReportsScreenProps) {
  const ranges = buildReportsPeriodRanges(periodSelection);
  const summaryQuery = useReportsCategorySummary(ranges, reportType);
  const summary = summaryQuery.summary;
  const selectedCategory =
    summary?.categories.find(
      (category) => category.categoryId === selectedCategoryId,
    ) ?? null;
  const hasSummary = summaryQuery.hasValidData && summary !== undefined;

  return (
    <div className={s.container}>
      <h1 className={s.title}>Отчёты</h1>
      <ReportTypeControls
        reportType={reportType}
        onReportTypeChange={onReportTypeChange}
      />
      <PeriodControls
        periodSelection={periodSelection}
        onPeriodSelectionChange={onPeriodSelectionChange}
      />
      {!summaryQuery.hasAccount ? (
        <p className={s.emptyState} role="status">
          Счёт не выбран.
        </p>
      ) : null}
      {summaryQuery.isLoading && (
        <div className={s.summarySkeleton} role="status" aria-label="Загрузка отчёта">
          <Skeleton
            {...(s.totalSkeleton ? { className: s.totalSkeleton } : {})}
          />
          <section aria-label="Загрузка категорий">
            <Skeleton
              {...(s.categorySkeleton ? { className: s.categorySkeleton } : {})}
            />
            <Skeleton
              {...(s.categorySkeleton ? { className: s.categorySkeleton } : {})}
            />
            <Skeleton
              {...(s.categorySkeleton ? { className: s.categorySkeleton } : {})}
            />
          </section>
        </div>
      )}
      {summaryQuery.isFetching && hasSummary && (
        <p className={s.updateStatus} role="status" aria-live="polite">
          Обновляем отчёт…
        </p>
      )}
      {summaryQuery.isError && summaryQuery.hasAccount && (
        <div className={s.errorState} role="alert">
          <SimpleError>
            {hasSummary
              ? "Не удалось обновить отчёт."
              : "Не удалось загрузить отчёт."}
          </SimpleError>
          <button
            className={s.retryButton}
            type="button"
            onClick={() => void summaryQuery.refetch()}
          >
            Повторить
          </button>
        </div>
      )}
      {hasSummary && (
        <>
          <TransactionSummary summary={summary} reportType={reportType} />
          <CategoryList
            categories={summary.categories}
            reportType={reportType}
            onCategorySelect={onCategorySelect}
          />
        </>
      )}
      <CategoryDetailSheet
        category={selectedCategory}
        from={ranges.current.from}
        to={ranges.current.to}
        reportType={reportType}
        onClose={onCategoryClose}
      />
    </div>
  );
}
