import { useEffect, useRef } from "react";

import { useNotifications } from "@/common/lib/notifications";

import type { InvitationRedemptionProps } from "../model/types.ts";
import { useInvitationRedemption } from "../model/use-invitation-redemption.ts";

import styles from "./invitation-redemption.module.css";

export function InvitationRedemption({
  code,
  onAuthenticationRequired,
  onRedeemed,
}: InvitationRedemptionProps) {
  const workflow = useInvitationRedemption(code);
  const { addNotification } = useNotifications();
  const completionReported = useRef(false);
  const loginReported = useRef(false);

  useEffect(() => {
    if (workflow.isUnauthorized && !loginReported.current) {
      loginReported.current = true;
      onAuthenticationRequired();
    }
  }, [onAuthenticationRequired, workflow.isUnauthorized]);

  useEffect(() => {
    if (
      workflow.phase !== "complete" ||
      completionReported.current ||
      !workflow.isCompletionCurrent()
    ) {
      return;
    }
    completionReported.current = true;
    addNotification({
      id: "inviteRedeemed",
      title: "Успешно",
      message: "Вы добавлены в аккаунт",
    });
    onRedeemed();
  }, [addNotification, onRedeemed, workflow]);

  const status = {
    checking: "Проверяем приглашение…",
    redeeming: "Принимаем приглашение…",
    refreshing: "Обновляем список счетов…",
    error: "Не удалось принять приглашение",
    complete: "Приглашение принято",
  }[workflow.phase];

  return (
    <section className={styles.root} aria-labelledby="invitation-title">
      <h1 id="invitation-title">Приглашение</h1>
      {workflow.isLoading && <p role="status">Проверяем вход…</p>}
      {workflow.isError &&
        !workflow.isUnauthorized &&
        !workflow.hasUsableMe &&
        !workflow.isRefreshError && (
          <div role="alert">
            <p>Не удалось проверить вход. Повторите запрос.</p>
            <button type="button" onClick={() => void workflow.refetch()}>
              Повторить
            </button>
          </div>
        )}
      {!workflow.isLoading &&
        (!workflow.isError || workflow.hasUsableMe) &&
        workflow.phase !== "complete" && <p role="status">{status}</p>}
      {workflow.phase === "error" && (
        <div role="alert">
          <p>{workflow.message}</p>
          <button type="button" onClick={() => workflow.retry()}>
            Повторить
          </button>
        </div>
      )}
    </section>
  );
}
