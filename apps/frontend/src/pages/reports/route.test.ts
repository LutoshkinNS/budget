import { describe, expect, it } from "vitest";

import { getCurrentDateValue, getCurrentMonthValue } from "@/modules/reports";

import { normalizeReportsSearch } from "./route.ts";

describe("reports route search", () => {
  const now = new Date(2026, 6, 20, 12);

  it("normalizes invalid and future search values", () => {
    expect(
      normalizeReportsSearch(
        {
          period: "unknown",
          month: "2999-01",
          fromDate: "bad",
          toDate: "2999-01-01",
        },
        now,
      ),
    ).toEqual({
      period: "month",
      month: getCurrentMonthValue(now),
      fromDate: getCurrentDateValue(now),
      toDate: getCurrentDateValue(now),
    });
  });

  it("falls back to today when custom range is reversed", () => {
    expect(
      normalizeReportsSearch(
        {
          period: "range",
          month: "2026-07",
          fromDate: "2026-07-15",
          toDate: "2026-07-10",
        },
        now,
      ),
    ).toEqual({
      period: "range",
      month: "2026-07",
      fromDate: getCurrentDateValue(now),
      toDate: getCurrentDateValue(now),
    });
  });

  it("keeps a valid selected category id in normalized search", () => {
    expect(
      normalizeReportsSearch(
        {
          period: "month",
          month: "2026-07",
          selectedCategoryId: "42",
        },
        now,
      ),
    ).toEqual({
      period: "month",
      month: "2026-07",
      fromDate: getCurrentDateValue(now),
      toDate: getCurrentDateValue(now),
      selectedCategoryId: 42,
    });
  });
});
