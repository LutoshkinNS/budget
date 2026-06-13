import { useEffect, useMemo, useState } from "react";

import { Route } from "@/app/routes/_private/dashboard";
import { ExpensesByDays } from "@/modules/expenses";
import { CategoryFilter } from "@/modules/expenses/modules/category-filter";
import {
  clampFutureMonth,
  getExpenseDateRange,
  PeriodSummary,
} from "@/modules/expenses/modules/period-summary";
import { UserFilter } from "@/modules/expenses/modules/user-filter";

import s from "./Dashboard.module.css";

export function Dashboard() {
  const { period, month } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const safeMonth = clampFutureMonth(month);
  const range = useMemo(
    () => getExpenseDateRange(period, safeMonth),
    [period, safeMonth],
  );

  useEffect(() => {
    void navigate({
      search: { period, month: safeMonth },
      replace: true,
    });
  }, [navigate, period, safeMonth]);

  return (
    <div className={s.container}>
      <h1 className={s.title}>Дашборд</h1>
      <PeriodSummary
        range={range}
        categoryId={categoryId}
        userId={userId}
        period={period}
        month={safeMonth}
        onPeriodChange={(nextPeriod) =>
          void navigate({
            search: { period: nextPeriod, month: safeMonth },
          })
        }
        onMonthChange={(nextMonth) =>
          void navigate({
            search: { period, month: clampFutureMonth(nextMonth) },
          })
        }
      />
      <CategoryFilter value={categoryId} onChange={setCategoryId} />
      <UserFilter value={userId} onChange={setUserId} />
      <ExpensesByDays
        range={range}
        categoryId={categoryId}
        userId={userId}
        onResetCategory={() => setCategoryId(null)}
        onResetUser={() => setUserId(null)}
      />
    </div>
  );
}
