import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  Dashboard,
  type DashboardSearchChangeHandler,
  validateDashboardSearch,
} from "@/pages/dashboard";

export const Route = createFileRoute("/_private/dashboard")({
  validateSearch: validateDashboardSearch,
  component: DashboardRoute,
});

function DashboardRoute() {
  const { period, month } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleSearchChange = useCallback<DashboardSearchChangeHandler>(
    (search, options) => {
      void navigate(
        options?.replace === undefined
          ? { search }
          : { search, replace: options.replace },
      );
    },
    [navigate],
  );

  return (
    <Dashboard
      period={period}
      month={month}
      onSearchChange={handleSearchChange}
    />
  );
}
