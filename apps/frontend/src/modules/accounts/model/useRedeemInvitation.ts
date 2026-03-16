import { queryClient } from "@/common/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsRedeemInvitation,
} from "@/common/api/generate/accounts/accounts.gen.ts";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

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
