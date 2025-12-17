import { useEffect } from "react";

import { useAuthMe } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { authMeResponse } from "@/kernel/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

export function useMe() {
  const { data, isError, error } = useAuthMe();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useMeError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = authMeResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useMeValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = authMeResponse.safeParse(data);
  return { data: data && validation.success ? validation.data : null };
}
