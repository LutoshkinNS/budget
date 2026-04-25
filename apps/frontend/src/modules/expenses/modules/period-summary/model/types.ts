export type Period = "day" | "week" | "month";

export const PERIOD_DAYS: Record<Period, number> = {
  day: 1,
  week: 7,
  month: 30,
};

export const periodToDays = (p: Period): number => PERIOD_DAYS[p];
