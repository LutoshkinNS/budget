import { Loader } from "@/common/ui/loader/Loader.tsx";
import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";

import {
  buildReportsPeriodRanges,
  type ReportsPeriodSelection,
} from "../model/period.ts";
import {
  type ReportsCategory,
  useReportsCategorySummary,
} from "../model/use-category-analytics.ts";
import { CategoryDetailSheet } from "../modules/category-detail-sheet";
import { CategoryList } from "../modules/category-list";
import { ExpenseSummary } from "../modules/expense-summary";
import { PeriodControls } from "../modules/period-controls";

import s from "./reports-screen.module.css";

type ReportsScreenProps = {
  periodSelection: ReportsPeriodSelection;
  selectedCategoryId: ReportsCategory["categoryId"] | undefined;
  onPeriodSelectionChange: (periodSelection: ReportsPeriodSelection) => void;
  onCategorySelect: (categoryId: ReportsCategory["categoryId"]) => void;
  onCategoryClose: () => void;
};

export function ReportsScreen({
  periodSelection,
  selectedCategoryId,
  onPeriodSelectionChange,
  onCategorySelect,
  onCategoryClose,
}: ReportsScreenProps) {
  const ranges = buildReportsPeriodRanges(periodSelection);
  const summaryQuery = useReportsCategorySummary(ranges);
  const summary = summaryQuery.summary;
  const selectedCategory =
    summary?.categories.find(
      (category) => category.categoryId === selectedCategoryId,
    ) ?? null;

  return (
    <div className={s.container}>
      <h1 className={s.title}>Отчёты</h1>
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
          <ExpenseSummary summary={summary} />
          <CategoryList
            categories={summary.categories}
            onCategorySelect={onCategorySelect}
          />
        </>
      )}
      <CategoryDetailSheet
        category={selectedCategory}
        from={ranges.current.from}
        to={ranges.current.to}
        onClose={onCategoryClose}
      />
    </div>
  );
}
