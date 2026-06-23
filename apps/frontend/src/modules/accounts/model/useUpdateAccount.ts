import { queryClient } from "@/common/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsUpdate,
} from "@/common/api/generate/accounts/accounts.gen.ts";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import type { AccountUpdateDTO } from "@/common/api/generate/model";
import { getTransactionsSummaryQueryKey } from "@/common/api/generate/transactions/transactions.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

export function useUpdateAccount() {
  const { addNotification } = useNotifications();
  const { mutate: rawMutate, ...rest } = useAccountsUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAccountsListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
        queryClient.invalidateQueries({
          queryKey: getTransactionsSummaryQueryKey(),
        });
      },
      onError: (error) => {
        addNotification({
          id: "useUpdateAccountError",
          title: error?.code || "Error",
          message: error?.message,
        });
      },
    },
  });

  const mutate = (
    accountId: number,
    data: AccountUpdateDTO,
    options?: Parameters<typeof rawMutate>[1],
  ) => rawMutate({ accountId, data }, options);

  return { mutate, ...rest };
}
