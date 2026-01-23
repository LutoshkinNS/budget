import { useEffect } from "react";

import { queryClient } from "@/kernel/api/appQuery.ts";
import {
  getAccountsListQueryKey,
  useAccountsList,
} from "@/kernel/api/generate/accounts/accounts.gen.ts";
import { accountsListResponse } from "@/kernel/api/generate/accounts/accounts.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

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
      const validation = accountsListResponse.safeParse(data);
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
