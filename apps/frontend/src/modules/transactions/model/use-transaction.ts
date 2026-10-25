import { useTransactionsGet } from "@/common/api/generate/transactions/transactions.gen.ts";
import { useCurrentAccountId } from "@/modules/user";

import { transactionKeys } from "./transaction-keys.ts";

export function useTransaction(transactionId: number) {
  const accountId = useCurrentAccountId();
  const isValidTransactionId =
    Number.isInteger(transactionId) &&
    Number.isFinite(transactionId) &&
    transactionId > 0;
  // Placeholder 1 при неизвестном счёте/невалидном id не попадает в сеть:
  // запрос отключён, а ключ строится только для известного счёта
  const query = useTransactionsGet(
    accountId ?? 1,
    isValidTransactionId ? transactionId : 1,
    {
      query: {
        // Ключ detail живёт в поддереве счёта — иначе инвалидация после
        // useUpdateTransaction перестанет затрагивать живой запрос экрана
        // редактирования. Условный spread вместо queryKey: undefined —
        // exactOptionalPropertyTypes
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
