import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  Reports,
  type ReportsSearchChangeHandler,
  validateReportsSearch,
} from "@/pages/reports";

export const Route = createFileRoute("/_private/reports")({
  validateSearch: validateReportsSearch,
  component: ReportsRoute,
});

function ReportsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const handleSearchChange = useCallback<ReportsSearchChangeHandler>(
    (nextSearch, options) => {
      void navigate(
        options?.replace === undefined
          ? { search: nextSearch }
          : { search: nextSearch, replace: options.replace },
      );
    },
    [navigate],
  );

  return <Reports search={search} onSearchChange={handleSearchChange} />;
}
