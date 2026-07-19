import type { SearchSchemaInput } from "@tanstack/react-router";

import {
  clampFutureMonth,
  getCurrentMonthValue,
  isMonthValue,
  isPeriod,
  type Period,
} from "@/modules/expenses/modules/period-summary";

export type DashboardSearch = {
  period: Period;
  month: string;
};

export type DashboardSearchInput = {
  period?: unknown;
  month?: unknown;
} & SearchSchemaInput;

export type DashboardSearchChangeOptions = {
  replace?: boolean;
};

export type DashboardSearchChangeHandler = (
  search: DashboardSearch,
  options?: DashboardSearchChangeOptions,
) => void;

export function validateDashboardSearch(
  search: DashboardSearchInput,
): DashboardSearch {
  const period = isPeriod(search.period) ? search.period : "month";
  const month = isMonthValue(search.month)
    ? clampFutureMonth(search.month)
    : getCurrentMonthValue();

  return { period, month };
}
