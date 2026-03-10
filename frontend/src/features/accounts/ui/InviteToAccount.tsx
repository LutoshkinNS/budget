import { useState } from "react";

import { useAccountsCreateInvitation } from "@/kernel/api/generate/accounts/accounts.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

type InviteToAccountProps = {
  accountId: number;
};

export function InviteToAccount({ accountId }: InviteToAccountProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const { mutate, isPending } = useAccountsCreateInvitation({
    mutation: {
      onSuccess: (data) => {
        const link = `${window.location.origin}/invite/${data.code}`;
        setInviteLink(link);
      },
      onError: (error) => {
        addNotification({
          id: "createInvitationError",
          title: error?.code || "Error",
          message: error?.message,
        });
      },
    },
  });

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    addNotification({
      id: "inviteLinkCopied",
      title: "Скопировано",
      message: "Ссылка скопирована в буфер обмена",
    });
  };

  return (
    <div>
      <button
        onClick={() => mutate({ accountId })}
        disabled={isPending}
      >
        Пригласить
      </button>

      {inviteLink && (
        <div>
          <span>{inviteLink}</span>
          <button onClick={handleCopy}>Копировать ссылку</button>
          <p>Действительна 72 часа</p>
        </div>
      )}
    </div>
  );
}
