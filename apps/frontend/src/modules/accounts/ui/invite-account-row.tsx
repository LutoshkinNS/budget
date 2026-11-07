import { useRef, useState } from "react";

import type { UserInfoDTO } from "@/common/api/generate/model";

import { useCreateInvitation } from "../model/use-create-invitation.ts";

import styles from "./invite-account-row.module.css";

type Account = UserInfoDTO["accounts"][number];

export function InviteAccountRow({ account }: { account: Account }) {
  const { createInvitation, isPending } = useCreateInvitation();
  const [inviteLink, setInviteLink] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [copyMessage, setCopyMessage] = useState<string>();
  const creating = useRef(false);

  async function handleCreateInvitation() {
    if (creating.current || isPending) return;

    creating.current = true;
    setErrorMessage(undefined);
    setCopyMessage(undefined);
    try {
      const invitation = await createInvitation(account.id);
      setInviteLink(
        new URL(
          "/invite/" + encodeURIComponent(invitation.code),
          window.location.origin,
        ).href,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не удалось создать приглашение. Попробуйте ещё раз.",
      );
    } finally {
      creating.current = false;
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyMessage("Ссылка скопирована в буфер обмена");
    } catch {
      setCopyMessage("Не удалось скопировать ссылку");
    }
  }

  return (
    <div className={styles.row} role="group" aria-label={account.name}>
      <span className={styles.accountName}>{account.name} -&gt;</span>
      <button
        type="button"
        onClick={() => void handleCreateInvitation()}
        disabled={isPending}
      >
        {errorMessage ? "Повторить" : isPending ? "Создание..." : "Пригласить"}
      </button>
      {inviteLink && (
        <div className={styles.result}>
          <a href={inviteLink}>{inviteLink}</a>
          <button type="button" onClick={() => void handleCopy()}>
            Копировать ссылку
          </button>
          <p>Действительна 72 часа</p>
        </div>
      )}
      {copyMessage && <p role="status">{copyMessage}</p>}
      {errorMessage && (
        <div role="alert">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
