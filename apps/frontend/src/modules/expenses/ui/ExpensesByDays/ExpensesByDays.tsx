import { Loader } from "@/common/ui/loader/Loader.tsx";

import { ExpenseDayGroup } from "../../modules/expense-day";
import { useExpenses } from "../../useExpenses.ts";

import s from "./ExpensesByDays.module.css";

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
