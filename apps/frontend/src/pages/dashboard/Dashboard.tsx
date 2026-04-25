import { useState } from "react";

import { ExpensesByDays } from "@/modules/expenses";
import { CategoryFilter } from "@/modules/expenses/modules/category-filter";
import {
  type Period,
  PeriodSummary,
  periodToDays,
} from "@/modules/expenses/modules/period-summary";

import s from "./Dashboard.module.css";

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const days = periodToDays(period);

  return (
    <div className={s.container}>
      <h1 className={s.title}>Дашборд</h1>
      <PeriodSummary
        days={days}
        categoryId={categoryId}
        period={period}
        onPeriodChange={setPeriod}
      />
      <CategoryFilter value={categoryId} onChange={setCategoryId} />
      <ExpensesByDays
        days={days}
        categoryId={categoryId}
        onResetCategory={() => setCategoryId(null)}
      />
    </div>
  );
}
