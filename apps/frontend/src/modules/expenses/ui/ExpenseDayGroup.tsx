import { useState } from "react";

import type { ExpenseDTO } from "@/common/api/generate/model/expenseDTO.gen.ts";
import clsx from "clsx";

import { ExpenseDayHeader } from "./ExpenseDayHeader.tsx";
import { ExpenseDayItem } from "./ExpenseDayItem.tsx";
import s from "./expenseDays.module.css";

type ExpenseDayGroupProps = {
  label: string;
  total: number;
  expenses: ExpenseDTO[];
};

export function ExpenseDayGroup({ label, total, expenses }: ExpenseDayGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={s.dayGroup}>
      <ExpenseDayHeader
        label={label}
        total={total}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
      <div className={clsx(s.dayGroupItems, !isExpanded && s.dayGroupItemsCollapsed)}>
        {expenses.map((expense) => (
          <ExpenseDayItem key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}
