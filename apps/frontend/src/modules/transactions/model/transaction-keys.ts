import type {
  TransactionsCategorySummaryParams,
  TransactionsListParams,
  TransactionsSummaryParams,
} from "@/common/api/generate/model";
import { accountKeys } from "@/common/api/query-keys";

export const transactionKeys = {
  all: (accountId: number) =>
    [...accountKeys.root(accountId), "transactions"] as const,
  lists: (accountId: number) =>
    [...transactionKeys.all(accountId), "list"] as const,
  list: (accountId: number, params?: TransactionsListParams) =>
    [...transactionKeys.lists(accountId), params ?? null] as const,
  details: (accountId: number) =>
    [...transactionKeys.all(accountId), "detail"] as const,
  detail: (accountId: number, transactionId: number) =>
    [...transactionKeys.details(accountId), transactionId] as const,
  summaries: (accountId: number) =>
    [...transactionKeys.all(accountId), "summary"] as const,
  summary: (accountId: number, params?: TransactionsSummaryParams) =>
    [...transactionKeys.summaries(accountId), params ?? null] as const,
  categorySummaries: (accountId: number) =>
    [...transactionKeys.all(accountId), "category-summary"] as const,
  categorySummary: (
    accountId: number,
    params?: TransactionsCategorySummaryParams,
  ) =>
    [...transactionKeys.categorySummaries(accountId), params ?? null] as const,
};
