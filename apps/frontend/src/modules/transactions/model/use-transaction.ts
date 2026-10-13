import { useTransactionsGet } from "@/common/api/generate/transactions/transactions.gen.ts";

export function useTransaction(transactionId: number) {
  const isValidTransactionId =
    Number.isInteger(transactionId) &&
    Number.isFinite(transactionId) &&
    transactionId > 0;
  const query = useTransactionsGet(isValidTransactionId ? transactionId : 1, {
    query: { enabled: isValidTransactionId },
  });
  return { ...query, isValidTransactionId };
}
