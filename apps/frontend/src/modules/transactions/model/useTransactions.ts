import { useEffect } from "react";
import type { z } from "zod";

import { queryClient } from "@/common/api/appQuery";
import type {
  TransactionDTO,
  TransactionsListParams,
  TransactionsSummaryParams,
} from "@/common/api/generate/model";
import {
  getTransactionsGetQueryKey,
  getTransactionsListQueryKey,
  getTransactionsSummaryQueryKey,
  useTransactionsList,
  useTransactionsSummary,
} from "@/common/api/generate/transactions/transactions.gen.ts";
import {
  TransactionsListResponse,
  TransactionsSummaryResponse,
} from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

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

export function useTransactions(
  range: TransactionDateRange = getDefaultTransactionDateRange(),
) {
  const { data, isError, error, isLoading } = useTransactionsList(range);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useTransactionsError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = TransactionsListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useTransactionsValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = TransactionsListResponse.safeParse(data);
  const transactions =
    validation.success && data ? validation.data.map(normalizeTransaction) : [];
  const groups = groupByDay(transactions);

  return { groups, transactions, isLoading };
}

export function useTransactionSummary(
  range: TransactionDateRange = getDefaultTransactionDateRange(),
) {
  const params = toSummaryParams(range);
  const { data, isError, error, isLoading } = useTransactionsSummary(params);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useTransactionSummaryError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = TransactionsSummaryResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useTransactionSummaryValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = TransactionsSummaryResponse.safeParse(data);

  return {
    data: validation.success && data ? validation.data : undefined,
    isLoading,
  };
}

export function useInvalidateTransactionsList() {
  return (params?: TransactionsListParams) => {
    if (!params) {
      return queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === "transactionsList",
      });
    }

    return queryClient.invalidateQueries({
      queryKey: getTransactionsListQueryKey(params),
    });
  };
}

export function useInvalidateTransaction() {
  return (transactionId: number) =>
    queryClient.invalidateQueries({
      queryKey: getTransactionsGetQueryKey(transactionId),
    });
}

export function useInvalidateTransactionSummary() {
  return (params?: TransactionsSummaryParams) => {
    if (!params) {
      return queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === "transactionsSummary",
      });
    }

    return queryClient.invalidateQueries({
      queryKey: getTransactionsSummaryQueryKey(params),
    });
  };
}
