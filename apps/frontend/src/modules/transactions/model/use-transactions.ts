import type { z } from "zod";

import type {
  TransactionDTO,
  TransactionsCategorySummaryParams,
  TransactionsListParams,
  TransactionsSummaryParams,
} from "@/common/api/generate/model";
import {
  useTransactionsCategorySummary,
  useTransactionsList,
  useTransactionsSummary,
} from "@/common/api/generate/transactions/transactions.gen.ts";
import {
  TransactionsListResponse,
  TransactionsSummaryResponse,
} from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useCurrentAccountId } from "@/modules/user";

import { useAccountScopedQuery } from "./account-scoped-query.ts";
import { transactionKeys } from "./transaction-keys.ts";

export type TransactionType = NonNullable<TransactionsListParams["type"]>;
export type TransactionDateRange = TransactionsListParams;

export type TransactionDayGroup = {
  label: string;
  isoDate: string;
  total: number;
  transactions: TransactionDTO[];
};

type ParsedTransaction = z.infer<typeof TransactionsListResponse>[number];

function normalizeTransaction(transaction: ParsedTransaction): TransactionDTO {
  return {
    ...transaction,
    description: transaction.description ?? null,
  };
}

function toIsoDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayLabel(isoDate: string): string {
  const today = toIsoDate(new Date().toISOString());
  const yesterday = toIsoDate(new Date(Date.now() - 86400000).toISOString());
  if (isoDate === today) return "сегодня";
  if (isoDate === yesterday) return "вчера";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function getDefaultTransactionDateRange(): TransactionDateRange {
  const now = new Date();
  return {
    from: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString(),
    to: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    ).toISOString(),
  };
}

function groupByDay(transactions: TransactionDTO[]): TransactionDayGroup[] {
  const map = new Map<string, TransactionDTO[]>();
  for (const transaction of transactions) {
    const key = toIsoDate(transaction.date);
    const group = map.get(key) ?? [];
    group.push(transaction);
    map.set(key, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([isoDate, items]) => ({
      isoDate,
      label: getDayLabel(isoDate),
      total: items.reduce((sum, e) => sum + e.amount, 0),
      transactions: items,
    }));
}

function toSummaryParams(
  range: TransactionDateRange,
): TransactionsSummaryParams {
  return {
    from: range.from,
    to: range.to,
  };
}

export function useTransactionsListQuery(
  params: TransactionsListParams,
  extraEnabled = true,
) {
  const accountId = useCurrentAccountId();
  const scoped = useAccountScopedQuery(
    (id) => transactionKeys.list(id, params),
    extraEnabled,
  );
  return useTransactionsList(accountId ?? 1, params, { query: scoped });
}

export function useTransactionsSummaryQuery(params: TransactionsSummaryParams) {
  const accountId = useCurrentAccountId();
  const scoped = useAccountScopedQuery((id) =>
    transactionKeys.summary(id, params),
  );
  return useTransactionsSummary(accountId ?? 1, params, { query: scoped });
}

export function useTransactionsCategorySummaryQuery(
  params: TransactionsCategorySummaryParams,
) {
  const accountId = useCurrentAccountId();
  const scoped = useAccountScopedQuery((id) =>
    transactionKeys.categorySummary(id, params),
  );
  return useTransactionsCategorySummary(accountId ?? 1, params, {
    query: scoped,
  });
}

export function useTransactions(
  range: TransactionDateRange = getDefaultTransactionDateRange(),
) {
  const accountId = useCurrentAccountId();
  const query = useTransactionsListQuery(range);
  const { data, isError, isLoading } = query;

  const validation = TransactionsListResponse.safeParse(data);
  const transactions =
    validation.success && data ? validation.data.map(normalizeTransaction) : [];
  const groups = groupByDay(transactions);
  const hasInvalidData = data !== undefined && !validation.success;

  return {
    groups,
    transactions,
    refetch: query.refetch,
    hasAccount: accountId != null,
    hasValidData: data !== undefined && validation.success,
    isLoading: accountId != null && isLoading,
    isError: isError || hasInvalidData,
  };
}

export function useTransactionSummary(
  range: TransactionDateRange = getDefaultTransactionDateRange(),
) {
  const accountId = useCurrentAccountId();
  const params = toSummaryParams(range);
  const query = useTransactionsSummaryQuery(params);
  const { data, isError, isLoading } = query;

  const validation = TransactionsSummaryResponse.safeParse(data);

  const hasValidData = data !== undefined && validation.success;
  const hasInvalidData = data !== undefined && !validation.success;

  return {
    data: hasValidData ? validation.data : undefined,
    hasAccount: accountId != null,
    hasValidData,
    isLoading: accountId != null && isLoading,
    isError: isError || hasInvalidData,
  };
}
