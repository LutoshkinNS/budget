import type { SearchSchemaInput } from "@tanstack/react-router";

import {
  getCurrentDateValue,
  getCurrentMonthValue,
  isReportsDateValue,
  isReportsMonthValue,
  isReportsPeriod,
  type ReportsPeriodSelection,
} from "@/modules/reports";

export type ReportsSearch = ReportsPeriodSelection & {
  selectedCategoryId?: number;
};

export type ReportsSearchChangeOptions = { replace?: boolean };
export type ReportsSearchChangeHandler = (
  search: ReportsSearch,
  options?: ReportsSearchChangeOptions,
) => void;

export type ReportsSearchInput = Partial<ReportsSearch> & SearchSchemaInput;

function dateValueToDate(value: string): Date {
  const [yearValue, monthValue, dayValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isFutureDate(value: string, now: Date): boolean {
  return dateValueToDate(value) > startOfDay(now);
}

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) {
    return value;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

export function normalizeReportsSearch(
  search: Partial<Record<keyof ReportsSearch, unknown>> = {},
  now: Date = new Date(),
): ReportsSearch {
  const currentMonth = getCurrentMonthValue(now);
  const currentDate = getCurrentDateValue(now);
  const period = isReportsPeriod(search.period) ? search.period : "month";
  const month =
    isReportsMonthValue(search.month) && search.month <= currentMonth
      ? search.month
      : currentMonth;
  const fromDate =
    isReportsDateValue(search.fromDate) && !isFutureDate(search.fromDate, now)
      ? search.fromDate
      : currentDate;
  const toDate =
    isReportsDateValue(search.toDate) && !isFutureDate(search.toDate, now)
      ? search.toDate
      : currentDate;

  const hasValidRange = dateValueToDate(fromDate) <= dateValueToDate(toDate);
  const selectedCategoryId = parsePositiveInteger(search.selectedCategoryId);
  const normalized = hasValidRange
    ? { period, month, fromDate, toDate }
    : { period, month, fromDate: currentDate, toDate: currentDate };

  return selectedCategoryId === undefined
    ? normalized
    : { ...normalized, selectedCategoryId };
}

export function validateReportsSearch(
  search: ReportsSearchInput,
): ReportsSearch {
  return normalizeReportsSearch(search);
}
