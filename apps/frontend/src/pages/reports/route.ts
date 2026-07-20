import type { SearchSchemaInput } from "@tanstack/react-router";

import { normalizeReportsSearch, type ReportsSearch } from "@/modules/reports";

export type ReportsSearchChangeOptions = { replace?: boolean };
export type ReportsSearchChangeHandler = (
  search: ReportsSearch,
  options?: ReportsSearchChangeOptions,
) => void;

export type ReportsSearchInput = Partial<ReportsSearch> & SearchSchemaInput;

export function validateReportsSearch(
  search: ReportsSearchInput,
): ReportsSearch {
  return normalizeReportsSearch(search);
}
