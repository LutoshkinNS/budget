import { useState } from "react";

import { useAccountsCreateInvitation } from "@/common/api/generate/accounts/accounts.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useMe } from "@/modules/user";

export function InviteToAccount() {
  const { data: me } = useMe();
  const ownedAccounts = me?.accounts.filter((a) => a.isOwner) ?? [];
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
    ownedAccounts.length > 0 && (
      <FormBlock legend={"Пригласить в аккаунт"}>
        {ownedAccounts.map((account) => (
          <div key={account.id}>
            <span>
              {account.name} -{">"}
            </span>
            <button
              type="button"
              onClick={() => mutate({ accountId: account.id })}
              disabled={isPending}
            >
              Пригласить
            </button>

            {inviteLink && (
              <div>
                <span>{inviteLink}</span>
                <button type="button" onClick={handleCopy}>
                  Копировать ссылку
                </button>
                <p>Действительна 72 часа</p>
              </div>
            )}
          </div>
        ))}
      </FormBlock>
    )
  );
}
