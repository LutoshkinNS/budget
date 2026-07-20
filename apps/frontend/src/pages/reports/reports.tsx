import { ReportsScreen, type ReportsSearch } from "@/modules/reports";

import type { ReportsSearchChangeHandler } from "./route.ts";

type ReportsProps = {
  search: ReportsSearch;
  onSearchChange: ReportsSearchChangeHandler;
};

export function Reports({ search, onSearchChange }: ReportsProps) {
  return <ReportsScreen search={search} onSearchChange={onSearchChange} />;
}
