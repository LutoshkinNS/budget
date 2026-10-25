import { useEffect } from "react";

import { useAccountsListMembers } from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsListMembersResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { useCurrentAccountId } from "@/modules/user";

import { memberKeys } from "./member-keys.ts";

export function useAccountMembers() {
  const accountId = useCurrentAccountId();
  // Placeholder 1 при неизвестном счёте не попадает в сеть: запрос отключён
  const { data, isError, error } = useAccountsListMembers(accountId ?? 1, {
    query: {
      // Ключ строим только для известного счёта; с exactOptionalPropertyTypes
      // нельзя передать queryKey: undefined, поэтому условный spread
      ...(accountId !== undefined && { queryKey: memberKeys.all(accountId) }),
      enabled: accountId != null,
    },
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
  return { data: validation.success ? validation.data : [] };
}
