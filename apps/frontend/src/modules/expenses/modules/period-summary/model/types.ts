export type Period = "day" | "week" | "month";

export type ExpenseDateRange = {
  from: string;
  to: string;
};

export const PERIOD_LABELS: Record<Period, string> = {
  day: "день",
  week: "неделя",
  month: "месяц",
};

export const PERIODS: Period[] = ["day", "week", "month"];

export function getCurrentMonthValue(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function isPeriod(value: unknown): value is Period {
  return (
    typeof value === "string" && (PERIODS as readonly string[]).includes(value)
  );
}

export function isMonthValue(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function clampFutureMonth(
  month: string,
  now: Date = new Date(),
): string {
  const currentMonth = getCurrentMonthValue(now);
  if (!isMonthValue(month)) return currentMonth;

  return month > currentMonth ? currentMonth : month;
}

function toDateTime(value: Date): string {
  return value.toISOString();
}

function getTomorrowStart(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function getExpenseDateRange(
  period: Period,
  month?: string,
  now: Date = new Date(),
): ExpenseDateRange {
  const tomorrowStart = getTomorrowStart(now);

  if (period === "day") {
    return {
      from: toDateTime(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      ),
      to: toDateTime(tomorrowStart),
    };
  }

  if (period === "week") {
    const mondayOffset = (now.getDay() + 6) % 7;
    return {
      from: toDateTime(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - mondayOffset,
        ),
      ),
      to: toDateTime(tomorrowStart),
    };
  }

  const selectedMonth = clampFutureMonth(month ?? getCurrentMonthValue(now), now);
  const year = Number(selectedMonth.slice(0, 4));
  const monthNumber = Number(selectedMonth.slice(5, 7));
  const from = new Date(year, monthNumber - 1, 1);
  const nextMonthStart = new Date(year, monthNumber, 1);
  const to =
    selectedMonth === getCurrentMonthValue(now) ? tomorrowStart : nextMonthStart;

  return {
    from: toDateTime(from),
    to: toDateTime(to),
  };
}
