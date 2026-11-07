import type { z } from "zod";

import type {
  TransactionDTO,
  TransactionsCategorySummaryParams,
  TransactionsListParams,
} from "@/common/api/generate/model";
import {
  TransactionsCategorySummaryResponse,
  TransactionsListResponse,
} from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import {
  useTransactionsCategorySummaryQuery,
  useTransactionsListQuery,
} from "@/modules/transactions";
import { useCurrentAccountId } from "@/modules/user";

import type { ReportsPeriodRanges } from "./period.ts";

export type ReportsCategorySummary = z.infer<
  typeof TransactionsCategorySummaryResponse
>;
export type ReportsCategory = ReportsCategorySummary["categories"][number];
export type ReportsCategoryTransaction = TransactionDTO;
export type ReportsTransactionType = NonNullable<
  TransactionsCategorySummaryParams["type"]
>;
type ReportsCategoryTransactionsParams = Pick<
  TransactionsListParams,
  "from" | "to"
> & {
  categoryId: NonNullable<TransactionsListParams["categoryId"]> | null;
  type: ReportsTransactionType;
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
  type: ReportsTransactionType,
): TransactionsCategorySummaryParams {
  return {
    from: ranges.current.from,
    to: ranges.current.to,
    compareFrom: ranges.compare.from,
    compareTo: ranges.compare.to,
    type,
  };
}

function toCategoryTransactionsParams({
  categoryId,
  from,
  to,
  type,
}: ReportsCategoryTransactionsParams): TransactionsListParams {
  return categoryId === null
    ? { from, to, type }
    : { from, to, type, categoryId };
}

export function useReportsCategorySummary(
  ranges: ReportsPeriodRanges,
  type: ReportsTransactionType,
) {
  const accountId = useCurrentAccountId();
  const params = toCategorySummaryParams(ranges, type);
  const query = useTransactionsCategorySummaryQuery(params);
  const { data } = query;
  const validation = TransactionsCategorySummaryResponse.safeParse(data);
  const hasAccount = accountId !== undefined;
  const hasValidData = hasAccount && data !== undefined && validation.success;
  const hasInvalidData = hasAccount && data !== undefined && !validation.success;

  return {
    summary: hasValidData && validation.success ? validation.data : undefined,
    hasAccount,
    hasValidData,
    isLoading: hasAccount && query.isLoading,
    isFetching: hasAccount && query.isFetching,
    isError: hasAccount && (query.isError || hasInvalidData),
    refetch: query.refetch,
  };
}

export function useReportsCategoryTransactions({
  categoryId,
  from,
  to,
  type,
}: ReportsCategoryTransactionsParams) {
  const accountId = useCurrentAccountId();
  const params = toCategoryTransactionsParams({ categoryId, from, to, type });
  const query = useTransactionsListQuery(params, categoryId !== null);
  const { data } = query;
  const validation = TransactionsListResponse.safeParse(data);
  const hasAccount = accountId !== undefined;
  const isEnabled = hasAccount && categoryId !== null;
  const hasValidData = isEnabled && data !== undefined && validation.success;
  const hasInvalidData = isEnabled && data !== undefined && !validation.success;

  return {
    transactions:
      hasValidData && validation.success
        ? validation.data.map(normalizeTransaction)
        : [],
    hasAccount,
    hasValidData,
    isLoading: isEnabled && query.isLoading,
    isFetching: isEnabled && query.isFetching,
    isError: isEnabled && (query.isError || hasInvalidData),
    refetch: query.refetch,
  };
}
