import type {
  ReportsCategory,
  ReportsCategorySummary,
  ReportsCategoryTransaction,
} from "./use-category-analytics.ts";

type ReportsMoneyAmount =
  | ReportsCategory["amount"]
  | ReportsCategorySummary["totalExpense"]
  | ReportsCategoryTransaction["amount"];
type ReportsChangePercent =
  | ReportsCategory["changePercent"]
  | ReportsCategorySummary["changePercent"];

export function formatMoney(value: ReportsMoneyAmount): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function formatPercent(value: NonNullable<ReportsChangePercent>): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })}%`;
}

export function formatExpenseShare(
  value: ReportsCategory["percentage"],
): string {
  return `${value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })}% от расходов`;
}

export function formatPeriodChange(value: ReportsChangePercent): string {
  if (value === null) return "К прошлому периоду: нет данных";
  return `${formatPercent(value)} к прошлому периоду`;
}

export function formatDate(value: ReportsCategoryTransaction["date"]): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
