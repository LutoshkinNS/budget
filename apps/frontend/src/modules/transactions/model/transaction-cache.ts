import type { QueryClient } from "@tanstack/react-query";

import type {
  TransactionsCategorySummaryParams,
  TransactionsListParams,
  TransactionsSummaryParams,
} from "@/common/api/generate/model";

import { transactionKeys } from "./transaction-keys.ts";

export function invalidateTransactionsList(
  queryClient: QueryClient,
  accountId: number,
  params?: TransactionsListParams,
) {
  return queryClient.invalidateQueries({
    queryKey:
      params === undefined
        ? transactionKeys.lists(accountId)
        : transactionKeys.list(accountId, params),
  });
}

export function invalidateTransaction(
  queryClient: QueryClient,
  accountId: number,
  transactionId: number,
) {
  return queryClient.invalidateQueries({
    queryKey: transactionKeys.detail(accountId, transactionId),
  });
}

export function invalidateTransactionSummary(
  queryClient: QueryClient,
  accountId: number,
  params?: TransactionsSummaryParams,
) {
  return queryClient.invalidateQueries({
    queryKey:
      params === undefined
        ? transactionKeys.summaries(accountId)
        : transactionKeys.summary(accountId, params),
  });
}

export function invalidateTransactionsCategorySummary(
  queryClient: QueryClient,
  accountId: number,
  params?: TransactionsCategorySummaryParams,
) {
  return queryClient.invalidateQueries({
    queryKey:
      params === undefined
        ? transactionKeys.categorySummaries(accountId)
        : transactionKeys.categorySummary(accountId, params),
  });
}
