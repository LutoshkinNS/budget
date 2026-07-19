import { useEffect, useMemo, useState } from "react";

import { ExpensesByDays } from "@/modules/expenses";
import {
  clampFutureMonth,
  getExpenseDateRange,
  PeriodSummary,
} from "@/modules/expenses/modules/period-summary";
import { UserFilter } from "@/modules/expenses/modules/user-filter";

import type { DashboardSearchChangeHandler } from "./route.ts";

import s from "./Dashboard.module.css";

type DashboardProps = {
  month: string;
  onSearchChange: DashboardSearchChangeHandler;
  period: Parameters<typeof getExpenseDateRange>[0];
};

export function Dashboard({ month, onSearchChange, period }: DashboardProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const safeMonth = clampFutureMonth(month);
  const range = useMemo(
    () => getExpenseDateRange(period, safeMonth),
    [period, safeMonth],
  );

  useEffect(() => {
    onSearchChange({ period, month: safeMonth }, { replace: true });
  }, [onSearchChange, period, safeMonth]);

  return (
    <div className={s.container}>
      <h1 className={s.title}>Дашборд</h1>
      <PeriodSummary
        range={range}
        period={period}
        month={safeMonth}
        onPeriodChange={(nextPeriod) =>
          onSearchChange({ period: nextPeriod, month: safeMonth })
        }
        onMonthChange={(nextMonth) =>
          onSearchChange({ period, month: clampFutureMonth(nextMonth) })
        }
      />
      <UserFilter value={userId} onChange={setUserId} />
      <ExpensesByDays
        mode="transactions"
        range={range}
        userId={userId}
        onResetUser={() => setUserId(null)}
      />
    </div>
  );
}
