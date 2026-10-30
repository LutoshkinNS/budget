import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import { formatDate, formatMoney } from "../../../model/formatters.ts";
import type { ReportsCategoryTransaction } from "../../../model/use-category-analytics.ts";

import s from "./category-detail-sheet.module.css";

type OperationsProps = {
  transactions: ReportsCategoryTransaction[];
  isLoading: boolean;
  hasValidData: boolean;
};

export function Operations({
  transactions,
  isLoading,
  hasValidData,
}: OperationsProps) {
  if (isLoading) {
    return (
      <div className={s.operationsSkeleton} role="status" aria-label="Загрузка операций">
        <Skeleton
          {...(s.operationSkeleton ? { className: s.operationSkeleton } : {})}
        />
        <Skeleton
          {...(s.operationSkeleton ? { className: s.operationSkeleton } : {})}
        />
        <Skeleton
          {...(s.operationSkeleton ? { className: s.operationSkeleton } : {})}
        />
      </div>
    );
  }
  if (!hasValidData) return null;
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
