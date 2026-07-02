import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuthLogout } from "@/common/api/generate/authentication/authentication.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

export function Logout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { isPending, mutate } = useAuthLogout({
    mutation: {
      onSuccess: async () => {
        queryClient.clear();
        await navigate({ to: "/login" });
      },
      onError: (error) => {
        addNotification({
          id: "useLogoutError",
          title: error?.code ?? "Ошибка выхода",
          message: error?.message ?? "Не удалось выйти из аккаунта",
        });
      },
    },
  });

  return (
    <button type="button" disabled={isPending} onClick={() => mutate()}>
      Выйти
    </button>
  );
}
