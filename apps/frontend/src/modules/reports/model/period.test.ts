import { describe, expect, it } from "vitest";

import {
  buildReportsPeriodRanges,
  type ReportsPeriodSelection,
} from "./period.ts";

describe("reports period model", () => {
  const now = new Date(2026, 6, 20, 12);
  const baseSelection: ReportsPeriodSelection = {
    period: "month",
    month: "2026-07",
    fromDate: "2026-07-20",
    toDate: "2026-07-20",
  };

  it("uses today for the day period and compares with yesterday", () => {
    const ranges = buildReportsPeriodRanges(
      { ...baseSelection, period: "day" },
      now,
    );

    expect(ranges.current).toEqual({
      from: new Date(2026, 6, 20).toISOString(),
      to: new Date(2026, 6, 21).toISOString(),
    });
    expect(ranges.compare).toEqual({
      from: new Date(2026, 6, 19).toISOString(),
      to: new Date(2026, 6, 20).toISOString(),
    });
  });

  it("uses the selected month and compares with the previous month", () => {
    const ranges = buildReportsPeriodRanges(
      { ...baseSelection, period: "month", month: "2026-06" },
      now,
    );

    expect(ranges.current).toEqual({
      from: new Date(2026, 5, 1).toISOString(),
      to: new Date(2026, 6, 1).toISOString(),
    });
    expect(ranges.compare).toEqual({
      from: new Date(2026, 4, 1).toISOString(),
      to: new Date(2026, 5, 1).toISOString(),
    });
  });

  it("uses the current week from Monday and compares with the previous week", () => {
    const ranges = buildReportsPeriodRanges(
      { ...baseSelection, period: "week" },
      now,
    );

    expect(ranges.current).toEqual({
      from: new Date(2026, 6, 20).toISOString(),
      to: new Date(2026, 6, 21).toISOString(),
    });
    expect(ranges.compare).toEqual({
      from: new Date(2026, 6, 13).toISOString(),
      to: new Date(2026, 6, 14).toISOString(),
    });
  });

  it("compares the current month with the same elapsed part of previous month", () => {
    const ranges = buildReportsPeriodRanges(
      { ...baseSelection, period: "month", month: "2026-07" },
      now,
    );

    expect(ranges.current).toEqual({
      from: new Date(2026, 6, 1).toISOString(),
      to: new Date(2026, 6, 21).toISOString(),
    });
    expect(ranges.compare).toEqual({
      from: new Date(2026, 5, 1).toISOString(),
      to: new Date(2026, 5, 21).toISOString(),
    });
  });

  it("treats custom range end date as inclusive and compares equal duration", () => {
    const ranges = buildReportsPeriodRanges(
      {
        ...baseSelection,
        period: "range",
        fromDate: "2026-07-10",
        toDate: "2026-07-15",
      },
      now,
    );

    expect(ranges.current).toEqual({
      from: new Date(2026, 6, 10).toISOString(),
      to: new Date(2026, 6, 16).toISOString(),
    });
    expect(ranges.compare).toEqual({
      from: new Date(2026, 6, 4).toISOString(),
      to: new Date(2026, 6, 10).toISOString(),
    });
  });
});
