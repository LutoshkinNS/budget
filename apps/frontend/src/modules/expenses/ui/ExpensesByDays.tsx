import { Loader } from "@/common/ui/loader/Loader.tsx";

import { useExpenses } from "../useExpenses.ts";
import { ExpenseDayHeader } from "./ExpenseDayHeader.tsx";
import { ExpenseDayItem } from "./ExpenseDayItem.tsx";
import s from "./expenseDays.module.css";

export function ExpensesByDays() {
  const { groups, isLoading } = useExpenses();

  if (isLoading) return <Loader />;

  if (groups.length === 0) return null;

  return (
    <div className={s.container}>
      {groups.map((group) => (
        <div key={group.isoDate} className={s.dayGroup}>
          <ExpenseDayHeader label={group.label} total={group.total} />
          {group.expenses.map((expense) => (
            <ExpenseDayItem key={expense.id} expense={expense} />
          ))}
        </div>
      ))}
    </div>
  );
}
