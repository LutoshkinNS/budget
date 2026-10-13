import { useState } from "react";
import clsx from "clsx";

import type { TransactionDTO } from "@/common/api/generate/model";

import { TransactionDayHeader } from "./transaction-day-header.tsx";
import { TransactionDayItem } from "./transaction-day-item.tsx";

import s from "./transaction-day.module.css";

type TransactionDayGroupProps = {
  label: string;
  total: number;
  transactions: TransactionDTO[];
  onEdit: (transactionId: number) => void;
};

export function TransactionDayGroup({
  label,
  total,
  transactions,
  onEdit,
}: TransactionDayGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={s.dayGroup}>
      <TransactionDayHeader
        label={label}
        total={total}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
      <div
        className={clsx(
          s.dayGroupItems,
          !isExpanded && s.dayGroupItemsCollapsed,
        )}
      >
        {transactions.map((transaction) => (
          <TransactionDayItem
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
