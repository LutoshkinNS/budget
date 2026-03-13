import { queryClient } from "@/common/api/appQuery.ts";
import { useAuthSwitchAccount } from "@/common/api/generate/authentication/authentication.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

export function useSwitchAccount() {
  const { addNotification } = useNotifications();

  return useAuthSwitchAccount({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        addNotification({
          id: "useSwitchAccountError",
          title: error?.code || "Error",
          message: error?.message,
        });
      },
    },
  });
}
