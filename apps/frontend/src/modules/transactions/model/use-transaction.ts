import {
  transactionsGet,
  useTransactionsGet,
} from "@/common/api/generate/transactions/transactions.gen.ts";
import { TransactionsGetResponse } from "@/common/api/generate/transactions/transactions.zod.gen.ts";
import { useCurrentAccountId } from "@/modules/user";

import { transactionKeys } from "./transaction-keys.ts";

export function useTransaction(transactionId: number) {
  const accountId = useCurrentAccountId();
  const isValidTransactionId =
    Number.isInteger(transactionId) &&
    Number.isFinite(transactionId) &&
    transactionId > 0;
  const hasAccount = accountId !== undefined;
  const query = useTransactionsGet(
    accountId ?? 1,
    isValidTransactionId ? transactionId : 1,
    {
      query: {
        ...(accountId !== undefined &&
          isValidTransactionId && {
            queryKey: transactionKeys.detail(accountId, transactionId),
          }),
        enabled: hasAccount && isValidTransactionId,
        queryFn: async ({ signal }) => {
          if (accountId === undefined || !isValidTransactionId) {
            throw new Error("Transaction query is disabled");
          }

          const data = await transactionsGet(accountId, transactionId, {
            signal,
          });
          const validation = TransactionsGetResponse.safeParse(data);

          if (
            !validation.success ||
            validation.data.id !== transactionId ||
            validation.data.accountId !== accountId
          ) {
            throw new Error("Invalid transaction response");
          }

          return { ...validation.data, description: validation.data.description ?? null };
        },
      },
    },
  );

  const validation = TransactionsGetResponse.safeParse(query.data);
  const hasValidData =
    hasAccount &&
    isValidTransactionId &&
    query.data !== undefined &&
    validation.success &&
    validation.data.id === transactionId &&
    validation.data.accountId === accountId;
  const hasInvalidData = query.data !== undefined && !hasValidData;
  const unavailableStatusCode =
    query.error !== null &&
    typeof query.error === "object" &&
    "statusCode" in query.error
      ? query.error.statusCode
      : undefined;

  return {
    ...query,
    data:
      hasValidData && validation.success
        ? { ...validation.data, description: validation.data.description ?? null }
        : undefined,
    hasAccount,
    hasValidData,
    isLoading: hasAccount && isValidTransactionId && query.isLoading,
    isFetching: hasAccount && isValidTransactionId && query.isFetching,
    isError:
      hasAccount &&
      isValidTransactionId &&
      (query.isError || hasInvalidData),
    isForbidden: query.isError && unavailableStatusCode === 403,
    isNotFound: query.isError && unavailableStatusCode === 404,
    isValidTransactionId,
  };
}
