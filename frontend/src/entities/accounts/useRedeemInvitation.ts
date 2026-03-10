import { queryClient } from "@/kernel/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsRedeemInvitation,
} from "@/kernel/api/generate/accounts/accounts.gen.ts";
import { getAuthMeQueryKey } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

export function useRedeemInvitation() {
  const { addNotification } = useNotifications();

  return useAccountsRedeemInvitation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAccountsListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
      },
      onError: (error) => {
        addNotification({
          id: "useRedeemInvitationError",
          title: error?.code || "Error",
          message: error?.message,
        });
      },
    },
  });
}
