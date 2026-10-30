import { useEffect, useRef } from "react";

import {
  type ReportsPeriodSelection,
  ReportsScreen,
  type ReportsTransactionType,
} from "@/modules/reports";
import { useCurrentAccountId } from "@/modules/user";

import type { ReportsSearch, ReportsSearchChangeHandler } from "./route.ts";

type ReportsProps = {
  search: ReportsSearch;
  onSearchChange: ReportsSearchChangeHandler;
};

export function Reports({ search, onSearchChange }: ReportsProps) {
  const accountId = useCurrentAccountId();
  const { selectedCategoryId, type: reportType, ...periodSelection } = search;
  const staleCategorySelection = useRef<{
    accountId: number | undefined;
    categoryId: NonNullable<ReportsSearch["selectedCategoryId"]>;
  } | null>(null);
  const pendingCategorySelection = useRef<{
    accountId: number | undefined;
    categoryId: NonNullable<ReportsSearch["selectedCategoryId"]>;
  } | null>(null);
  const observedAccount = useRef({
    id: accountId,
    initialized: accountId !== undefined,
  });
  const isAccountChanging =
    observedAccount.current.initialized && observedAccount.current.id !== accountId;
  const staleSelection = staleCategorySelection.current;
  const pendingSelection = pendingCategorySelection.current;
  const isStaleCategorySelection =
    selectedCategoryId !== undefined &&
    staleSelection !== null &&
    staleSelection.accountId === accountId &&
    staleSelection.categoryId === selectedCategoryId &&
    !(
      pendingSelection !== null &&
      pendingSelection.accountId === accountId &&
      pendingSelection.categoryId === selectedCategoryId
    );

  useEffect(() => {
    if (!observedAccount.current.initialized) {
      if (accountId !== undefined) {
        observedAccount.current = { id: accountId, initialized: true };
      }
      return;
    }

    if (observedAccount.current.id === accountId) return;

    pendingCategorySelection.current = null;
    if (selectedCategoryId !== undefined) {
      staleCategorySelection.current = { accountId, categoryId: selectedCategoryId };
    }
    observedAccount.current.id = accountId;
    if (selectedCategoryId !== undefined) {
      onSearchChange(
        { ...periodSelection, type: reportType },
        { replace: true },
      );
    }
  }, [accountId, onSearchChange, periodSelection, reportType, selectedCategoryId]);

  useEffect(() => {
    const staleSelection = staleCategorySelection.current;
    if (
      staleSelection &&
      staleSelection.categoryId !== selectedCategoryId
    ) {
      staleCategorySelection.current = null;
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    const pendingSelection = pendingCategorySelection.current;
    if (
      pendingSelection &&
      pendingSelection.accountId === accountId &&
      pendingSelection.categoryId === selectedCategoryId
    ) {
      pendingCategorySelection.current = null;
    }
  }, [accountId, selectedCategoryId]);

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
    pendingCategorySelection.current = { accountId, categoryId };
    onSearchChange({ ...search, selectedCategoryId: categoryId });
  };
  const handleCategoryClose = () => {
    onSearchChange({ ...periodSelection, type: reportType }, { replace: true });
  };

  return (
    <ReportsScreen
      periodSelection={periodSelection}
      reportType={reportType}
      selectedCategoryId={
        isAccountChanging || isStaleCategorySelection
          ? undefined
          : selectedCategoryId
      }
      onPeriodSelectionChange={handlePeriodSelectionChange}
      onReportTypeChange={handleReportTypeChange}
      onCategorySelect={handleCategorySelect}
      onCategoryClose={handleCategoryClose}
    />
  );
}
