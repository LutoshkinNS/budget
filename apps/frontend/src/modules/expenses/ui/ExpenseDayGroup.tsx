import { useState } from "react";

import type { ExpenseDTO } from "@/common/api/generate/model/expenseDTO.gen.ts";

import { ExpenseDayHeader } from "./ExpenseDayHeader.tsx";
import { ExpenseDayItem } from "./ExpenseDayItem.tsx";
import s from "./expenseDays.module.css";

type ExpenseDayGroupProps = {
  isoDate: string;
  label: string;
  total: number;
  expenses: ExpenseDTO[];
};

export function ExpenseDayGroup({ isoDate, label, total, expenses }: ExpenseDayGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div key={isoDate} className={s.dayGroup}>
      <ExpenseDayHeader
        label={label}
        total={total}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
      {isExpanded &&
        expenses.map((expense) => (
          <ExpenseDayItem key={expense.id} expense={expense} />
        ))}
    </div>
  );
}
