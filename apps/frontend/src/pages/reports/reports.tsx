import {
  type ReportsPeriodSelection,
  ReportsScreen,
  type ReportsTransactionType,
} from "@/modules/reports";

import type { ReportsSearch, ReportsSearchChangeHandler } from "./route.ts";

type ReportsProps = {
  search: ReportsSearch;
  onSearchChange: ReportsSearchChangeHandler;
};

export function Reports({ search, onSearchChange }: ReportsProps) {
  const { selectedCategoryId, type: reportType, ...periodSelection } = search;

  const handlePeriodSelectionChange = (
    nextPeriodSelection: ReportsPeriodSelection,
  ) => {
    onSearchChange({ ...nextPeriodSelection, type: reportType });
  };
  const handleReportTypeChange = (nextReportType: ReportsTransactionType) => {
    onSearchChange({ ...periodSelection, type: nextReportType });
  };
  const handleCategorySelect = (
    categoryId: NonNullable<ReportsSearch["selectedCategoryId"]>,
  ) => {
    onSearchChange({ ...search, selectedCategoryId: categoryId });
  };
  const handleCategoryClose = () => {
    onSearchChange({ ...periodSelection, type: reportType }, { replace: true });
  };

  return (
    <ReportsScreen
      periodSelection={periodSelection}
      reportType={reportType}
      selectedCategoryId={selectedCategoryId}
      onPeriodSelectionChange={handlePeriodSelectionChange}
      onReportTypeChange={handleReportTypeChange}
      onCategorySelect={handleCategorySelect}
      onCategoryClose={handleCategoryClose}
    />
  );
}
