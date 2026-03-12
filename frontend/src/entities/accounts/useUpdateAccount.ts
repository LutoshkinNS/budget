import { queryClient } from "@/kernel/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsUpdate,
} from "@/kernel/api/generate/accounts/accounts.gen.ts";
import type { AccountUpdateDTO } from "@/kernel/api/generate/model";
import { getAuthMeQueryKey } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

export function useUpdateAccount() {
  const { addNotification } = useNotifications();
  const { mutate: rawMutate, ...rest } = useAccountsUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAccountsListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
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