import { queryClient } from "@/common/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsUpdate,
} from "@/common/api/generate/accounts/accounts.gen.ts";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import type { AccountUpdateDTO } from "@/common/api/generate/model";
import { useNotifications } from "@/common/lib/notifications";
import { invalidateTransactionSummary } from "@/modules/transactions";

export function useUpdateAccount() {
  const { addNotification } = useNotifications();
  const { mutate: rawMutate, ...rest } = useAccountsUpdate({
    mutation: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: getAccountsListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
        invalidateTransactionSummary(variables.accountId);
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
