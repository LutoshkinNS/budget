import { queryClient } from "@/common/api/appQuery";
import type {
  TransactionsCategorySummaryParams,
  TransactionsListParams,
  TransactionsSummaryParams,
} from "@/common/api/generate/model";

import { transactionKeys } from "./transaction-keys.ts";

/**
 * Публичные cache-команды инвалидации: наружу отдаётся только scope,
 * состав ключей — приватная деталь фабрики transactionKeys. Счёт обязателен:
 * он приходит из variables мутации или выбранного счёта, тихий пропуск
 * невозможен по построению.
 */

export function invalidateTransactionsList(
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
  accountId: number,
  transactionId: number,
) {
  return queryClient.invalidateQueries({
    queryKey: transactionKeys.detail(accountId, transactionId),
  });
}

export function invalidateTransactionSummary(
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
