import { useState } from "react";

import { ExpensesByDays } from "@/modules/expenses";
import { CategoryFilter } from "@/modules/expenses/modules/category-filter";
import {
  type Period,
  PeriodSummary,
  periodToDays,
} from "@/modules/expenses/modules/period-summary";
import { UserFilter } from "@/modules/expenses/modules/user-filter";

import s from "./Dashboard.module.css";

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const days = periodToDays(period);

  return (
    <div className={s.container}>
      <h1 className={s.title}>Дашборд</h1>
      <PeriodSummary
        days={days}
        categoryId={categoryId}
        userId={userId}
        period={period}
        onPeriodChange={setPeriod}
      />
      <CategoryFilter value={categoryId} onChange={setCategoryId} />
      <UserFilter value={userId} onChange={setUserId} />
      <ExpensesByDays
        days={days}
        categoryId={categoryId}
        userId={userId}
        onResetCategory={() => setCategoryId(null)}
        onResetUser={() => setUserId(null)}
      />
    </div>
  );
}
