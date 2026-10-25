import { useTransactionsGet } from "@/common/api/generate/transactions/transactions.gen.ts";
import { useCurrentAccountId } from "@/modules/user";

import { transactionKeys } from "./transaction-keys.ts";

export function useTransaction(transactionId: number) {
  const accountId = useCurrentAccountId();
  const isValidTransactionId =
    Number.isInteger(transactionId) &&
    Number.isFinite(transactionId) &&
    transactionId > 0;
  // Без выбранного счёта placeholder не отправляется: запрос отключён.
  const query = useTransactionsGet(
    accountId ?? 1,
    isValidTransactionId ? transactionId : 1,
    {
      query: {
        // Запрос редактирования должен использовать общий ключ инвалидации.
        ...(accountId !== undefined &&
          isValidTransactionId && {
            queryKey: transactionKeys.detail(accountId, transactionId),
          }),
        enabled: accountId != null && isValidTransactionId,
      },
    },
  );
  return { ...query, isValidTransactionId };
}
