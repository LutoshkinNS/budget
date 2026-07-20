import { type ReportsPeriodSelection, ReportsScreen } from "@/modules/reports";

import type { ReportsSearch, ReportsSearchChangeHandler } from "./route.ts";

type ReportsProps = {
  search: ReportsSearch;
  onSearchChange: ReportsSearchChangeHandler;
};

export function Reports({ search, onSearchChange }: ReportsProps) {
  const { selectedCategoryId, ...periodSelection } = search;

  const handlePeriodSelectionChange = (
    nextPeriodSelection: ReportsPeriodSelection,
  ) => {
    onSearchChange(nextPeriodSelection);
  };
  const handleCategorySelect = (categoryId: number) => {
    onSearchChange({ ...search, selectedCategoryId: categoryId });
  };
  const handleCategoryClose = () => {
    onSearchChange(periodSelection, { replace: true });
  };

  return (
    <ReportsScreen
      periodSelection={periodSelection}
      selectedCategoryId={selectedCategoryId}
      onPeriodSelectionChange={handlePeriodSelectionChange}
      onCategorySelect={handleCategorySelect}
      onCategoryClose={handleCategoryClose}
    />
  );
}
