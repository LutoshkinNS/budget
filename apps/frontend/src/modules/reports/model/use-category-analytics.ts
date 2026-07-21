import { useEffect } from "react";
import type { z } from "zod";

import type {
  TransactionDTO,
  TransactionsCategorySummaryParams,
  TransactionsListParams,
} from "@/common/api/generate/model";
import {
  useTransactionsCategorySummary,
  useTransactionsList,
} from "@/common/api/generate/transactions/transactions.gen.ts";
import {
  TransactionsCategorySummaryResponse,
  TransactionsListResponse,
} from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import type { ReportsPeriodRanges } from "./period.ts";

export type ReportsCategorySummary = z.infer<
  typeof TransactionsCategorySummaryResponse
>;
export type ReportsCategory = ReportsCategorySummary["categories"][number];
export type ReportsCategoryTransaction = TransactionDTO;
type ReportsCategoryTransactionsParams = Pick<
  TransactionsListParams,
  "from" | "to"
> & {
  categoryId: NonNullable<TransactionsListParams["categoryId"]> | null;
};

function normalizeTransaction(
  transaction: z.infer<typeof TransactionsListResponse>[number],
): TransactionDTO {
  return {
    ...transaction,
    description: transaction.description ?? null,
  };
}

function toCategorySummaryParams(
  ranges: ReportsPeriodRanges,
): TransactionsCategorySummaryParams {
  return {
    from: ranges.current.from,
    to: ranges.current.to,
    compareFrom: ranges.compare.from,
    compareTo: ranges.compare.to,
  };
}

function toCategoryTransactionsParams({
  categoryId,
  from,
  to,
}: ReportsCategoryTransactionsParams): TransactionsListParams {
  return categoryId === null
    ? { from, to, type: "expense" }
    : { from, to, type: "expense", categoryId };
}

export function useReportsCategorySummary(ranges: ReportsPeriodRanges) {
  const params = toCategorySummaryParams(ranges);
  const { data, isError, error, isLoading } =
    useTransactionsCategorySummary(params);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useReportsCategorySummaryError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = TransactionsCategorySummaryResponse.safeParse(data);

      if (!validation.success) {
        addNotification({
          id: "useReportsCategorySummaryValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = TransactionsCategorySummaryResponse.safeParse(data);

  return {
    summary: validation.success ? validation.data : undefined,
    isLoading,
    isError,
  };
}

export function useReportsCategoryTransactions({
  categoryId,
  from,
  to,
}: ReportsCategoryTransactionsParams) {
  const params = toCategoryTransactionsParams({ categoryId, from, to });
  const { data, isError, error, isLoading } = useTransactionsList(params, {
    query: { enabled: categoryId !== null },
  });
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useReportsCategoryTransactionsError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = TransactionsListResponse.safeParse(data);

      if (!validation.success) {
        addNotification({
          id: "useReportsCategoryTransactionsValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = TransactionsListResponse.safeParse(data);

  return {
    transactions:
      validation.success && data
        ? validation.data.map(normalizeTransaction)
        : [],
    isLoading,
    isError,
  };
}
