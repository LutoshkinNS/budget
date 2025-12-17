import { z } from "zod";

import { useAuthLogin } from "@/kernel/api/generate/authentication/authentication.gen.ts";
import { authLoginBody } from "@/kernel/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

import { LoginData } from "./types.ts";

export function useLogin() {
  const { addNotification } = useNotifications();
  const { mutateAsync } = useAuthLogin({
    mutation: {
      onError: (error) => {
        addNotification({
          id: "useLoginError",
          title: error?.code,
          message: error?.message,
        });
      },
    },
  });

  const login = async (data: LoginData) => {
    const validateResult = authLoginBody.safeParse(data);

    if (!validateResult.success) {
      const errors = z.prettifyError(validateResult.error);

      addNotification({
        id: "useLoginError",
        title: "Некорректные данные",
        message: errors,
      });

      return;
    }

    const filteredData = {
      id: validateResult.data.id,
      first_name: validateResult.data.first_name,
      auth_date: validateResult.data.auth_date,
      hash: validateResult.data.hash,
      ...(validateResult.data.last_name !== undefined && {
        last_name: validateResult.data.last_name,
      }),
      ...(validateResult.data.username !== undefined && {
        username: validateResult.data.username,
      }),
      ...(validateResult.data.photo_url !== undefined && {
        photo_url: validateResult.data.photo_url,
      }),
    };

    return await mutateAsync({
      data: filteredData,
    });
  };

  return { login };
}
