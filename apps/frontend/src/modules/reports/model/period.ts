export type ReportsPeriod = "day" | "week" | "month" | "range";

export type ReportsSearch = {
  period: ReportsPeriod;
  month: string;
  fromDate: string;
  toDate: string;
  selectedCategoryId?: number;
};

export type ReportsPeriodRange = {
  from: string;
  to: string;
};

export type ReportsPeriodRanges = {
  current: ReportsPeriodRange;
  compare: ReportsPeriodRange;
};

const PERIODS = ["day", "week", "month", "range"] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getCurrentDateValue(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getCurrentMonthValue(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isValidDateValue(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const [year, month, day] = value.split("-").map(Number);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

function dateValueToDate(value: string): Date {
  const [yearValue, monthValue, dayValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  return new Date(year, month - 1, day);
}

function dateToValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function toIso(date: Date): string {
  return date.toISOString();
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
  const period = PERIODS.includes(search.period as ReportsPeriod)
    ? (search.period as ReportsPeriod)
    : "month";
  const month =
    typeof search.month === "string" &&
    MONTH_PATTERN.test(search.month) &&
    search.month <= currentMonth
      ? search.month
      : currentMonth;
  const fromDate =
    isValidDateValue(search.fromDate) && !isFutureDate(search.fromDate, now)
      ? search.fromDate
      : currentDate;
  const toDate =
    isValidDateValue(search.toDate) && !isFutureDate(search.toDate, now)
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

export function buildReportsPeriodRanges(
  search: Partial<ReportsSearch>,
  now: Date = new Date(),
): ReportsPeriodRanges {
  const normalized = normalizeReportsSearch(search, now);
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  let from: Date;
  let to: Date;
  let compare: ReportsPeriodRange;

  if (normalized.period === "day") {
    from = today;
    to = tomorrow;
    compare = {
      from: toIso(addDays(from, -1)),
      to: toIso(from),
    };
  } else if (normalized.period === "week") {
    const mondayOffset = (today.getDay() + 6) % 7;
    from = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - mondayOffset,
    );
    to = addDays(from, 7);
    if (to > tomorrow) to = tomorrow;

    const duration = to.getTime() - from.getTime();
    const previousWeekFrom = addDays(from, -7);
    compare = {
      from: toIso(previousWeekFrom),
      to: toIso(new Date(previousWeekFrom.getTime() + duration)),
    };
  } else if (normalized.period === "month") {
    const [yearValue, monthValue] = normalized.month.split("-");
    const year = Number(yearValue);
    const month = Number(monthValue);
    from = new Date(year, month - 1, 1);
    to = new Date(year, month, 1);
    const previousMonthFrom = new Date(
      from.getFullYear(),
      from.getMonth() - 1,
      1,
    );

    if (normalized.month === getCurrentMonthValue(now)) {
      if (to > tomorrow) to = tomorrow;

      const duration = to.getTime() - from.getTime();
      compare = {
        from: toIso(previousMonthFrom),
        to: toIso(new Date(previousMonthFrom.getTime() + duration)),
      };
    } else {
      compare = {
        from: toIso(previousMonthFrom),
        to: toIso(from),
      };
    }
  } else {
    from = dateValueToDate(normalized.fromDate);
    to = addDays(dateValueToDate(normalized.toDate), 1);

    const duration = to.getTime() - from.getTime();
    compare = {
      from: toIso(new Date(from.getTime() - duration)),
      to: toIso(from),
    };
  }
  return {
    current: { from: toIso(from), to: toIso(to) },
    compare,
  };
}

export function isReportsPeriod(value: unknown): value is ReportsPeriod {
  return PERIODS.includes(value as ReportsPeriod);
}

export function isReportsMonthValue(value: unknown): value is string {
  return typeof value === "string" && MONTH_PATTERN.test(value);
}

export function isReportsDateValue(value: unknown): value is string {
  return isValidDateValue(value);
}

export { dateToValue };
