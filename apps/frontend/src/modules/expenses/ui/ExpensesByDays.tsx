import { Loader } from "@/common/ui/loader/Loader.tsx";

import { useExpenses } from "../useExpenses.ts";

import { ExpenseDayGroup } from "./ExpenseDayGroup.tsx";

import s from "./expenseDays.module.css";

export function ExpensesByDays() {
  const { groups, isLoading } = useExpenses();

  if (isLoading) return <Loader />;

  if (groups.length === 0) return null;

  return (
    <div className={s.container}>
      {groups.map((group) => (
        <ExpenseDayGroup
          key={group.isoDate}
          label={group.label}
          total={group.total}
          expenses={group.expenses}
        />
      ))}
    </div>
  );
}
