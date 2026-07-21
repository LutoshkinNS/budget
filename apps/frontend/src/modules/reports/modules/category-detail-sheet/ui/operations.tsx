import { Loader } from "@/common/ui/loader/Loader.tsx";

import { formatDate, formatMoney } from "../../../model/formatters.ts";
import type { ReportsCategoryTransaction } from "../../../model/use-category-analytics.ts";

import s from "./category-detail-sheet.module.css";

type OperationsProps = {
  transactions: ReportsCategoryTransaction[];
  isLoading: boolean;
};

export function Operations({ transactions, isLoading }: OperationsProps) {
  if (isLoading) return <Loader />;
  if (!transactions?.length)
    return <p className={s.empty}>Операций за этот период нет.</p>;

  return (
    <ul className={s.operations}>
      {transactions.map((transaction) => (
        <li key={transaction.id} className={s.operation}>
          <span>
            <strong>{formatMoney(transaction.amount)}</strong>
            {transaction.description && (
              <small>{transaction.description}</small>
            )}
          </span>
          <time dateTime={transaction.date}>
            {formatDate(transaction.date)}
          </time>
        </li>
      ))}
    </ul>
  );
}
