import { Loader } from "@/common/ui/loader/Loader.tsx";
import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";

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
      {summaryQuery.isLoading && <Loader />}
      {summaryQuery.isError && (
        <SimpleError>Не удалось загрузить отчёт.</SimpleError>
      )}
      {summary && (
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
