import type { SearchSchemaInput } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

import {
  clampFutureMonth,
  getCurrentMonthValue,
  isMonthValue,
  isPeriod,
  type Period,
} from "@/modules/expenses/modules/period-summary";
import { Dashboard } from "@/pages/dashboard";

export type DashboardSearch = {
  period: Period;
  month: string;
};

type DashboardSearchInput = {
  period?: unknown;
  month?: unknown;
} & SearchSchemaInput;

export const Route = createFileRoute("/_private/dashboard")({
  validateSearch: (search: DashboardSearchInput): DashboardSearch => {
    const period = isPeriod(search.period) ? search.period : "month";
    const month = isMonthValue(search.month)
      ? clampFutureMonth(search.month)
      : getCurrentMonthValue();

    return { period, month };
  },
  component: Dashboard,
});
