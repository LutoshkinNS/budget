import { useState } from "react";
import clsx from "clsx";

import type { ExpenseDTO } from "../../../model/useExpenses.ts";

import { ExpenseDayHeader } from "./ExpenseDayHeader.tsx";
import { ExpenseDayItem } from "./ExpenseDayItem.tsx";

import s from "./expenseDay.module.css";

type ExpenseDayGroupProps = {
  label: string;
  total: number;
  expenses: ExpenseDTO[];
  showSignedAmounts?: boolean;
};

export function ExpenseDayGroup({
  label,
  total,
  expenses,
  showSignedAmounts = false,
}: ExpenseDayGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={s.dayGroup}>
      <ExpenseDayHeader
        label={label}
        total={total}
        isExpanded={isExpanded}
        showSignedAmount={showSignedAmounts}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
      <div className={clsx(s.dayGroupItems, !isExpanded && s.dayGroupItemsCollapsed)}>
        {expenses.map((expense) => (
          <ExpenseDayItem
            key={expense.id}
            expense={expense}
            showSignedAmount={showSignedAmounts}
          />
        ))}
      </div>
    </div>
  );
}
