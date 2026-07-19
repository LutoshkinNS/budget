import { useEffect } from "react";

import { useAccountsListMembers } from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsListMembersResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { useMe } from "@/modules/user";

export function useAccountMembers() {
  const { data: me } = useMe();
  const accountId = me?.currentAccountId;

  const { data, isError, error } = useAccountsListMembers(accountId!, {
    query: { enabled: accountId != null },
  });
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useAccountMembersError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = AccountsListMembersResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useAccountMembersValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = AccountsListMembersResponse.safeParse(data);
  return { data: validation.success && data ? validation.data : [] };
}
