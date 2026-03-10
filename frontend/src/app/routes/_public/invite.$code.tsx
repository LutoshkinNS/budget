import { useLayoutEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useRedeemInvitation } from "@/entities/accounts";
import { useMe } from "@/entities/user";
import { INVITE_CODE_KEY } from "@/features/auth";
import { useNotifications } from "@/shared/lib/notifications";

function InvitePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const { data: me, isLoading } = useMe();
  const { mutate: redeem } = useRedeemInvitation();
  const { addNotification } = useNotifications();

  useLayoutEffect(() => {
    if (isLoading) return;

    if (!me) {
      sessionStorage.setItem(INVITE_CODE_KEY, code);
      void navigate({ to: "/login" });
      return;
    }

    redeem(
      { data: { code } },
      {
        onSuccess: () => {
          addNotification({
            id: "inviteRedeemed",
            title: "Успешно",
            message: "Вы добавлены в аккаунт",
          });
        },
        onSettled: () => {
          void navigate({ to: "/" });
        },
      },
    );
  }, [me, isLoading, code, navigate, redeem, addNotification]);

  return <div>Обработка приглашения...</div>;
}

export const Route = createFileRoute("/_public/invite/$code")({
  component: InvitePage,
});
