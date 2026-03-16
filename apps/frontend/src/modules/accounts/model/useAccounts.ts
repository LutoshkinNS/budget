import { useEffect } from "react";

import { queryClient } from "@/common/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsList,
} from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsListResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

export function useAccounts() {
  const { data, error, isError, ...other } = useAccountsList();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useAccountsListError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = AccountsListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useCategoriesValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  return { data: data ? data : [], error, isError, ...other };
}

export function useInvalidateAccounts() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: getAccountsListQueryKey(),
    });
}
