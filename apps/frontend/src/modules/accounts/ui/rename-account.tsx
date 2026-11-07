import { useLayoutEffect, useRef, useState } from "react";

import type { UserInfoDTO } from "@/common/api/generate/model";
import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useCurrentAccountId, useMe } from "@/modules/user";

import { useUpdateAccount } from "../model/use-update-account.ts";

import styles from "./rename-account.module.css";

type Account = UserInfoDTO["accounts"][number];

export function RenameAccount() {
  const { data: me } = useMe();
  const currentAccountId = useCurrentAccountId();
  const currentAccount = me?.accounts.find(
    (account) => account.id === currentAccountId,
  );

  if (!me || !currentAccount) return null;

  return (
    <RenameAccountForm
      key={me.userId + "-" + currentAccount.id}
      account={currentAccount}
    />
  );
}

function RenameAccountForm({ account }: { account: Account }) {
  const { updateAccount } = useUpdateAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [initialBalance, setInitialBalance] = useState(
    String(account.initialBalance),
  );
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const submitting = useRef(false);
  const origin = useRef({ active: false });
  const trimmedInitialBalance = initialBalance.trim();
  const isInitialBalanceValid =
    trimmedInitialBalance.length > 0 &&
    Number.isFinite(Number(trimmedInitialBalance.replace(",", ".")));

  useLayoutEffect(() => {
    const currentOrigin = origin.current;
    currentOrigin.active = true;
    return () => {
      currentOrigin.active = false;
    };
  }, []);

  function openEditor() {
    if (!account.isOwner) return;
    setName(account.name);
    setInitialBalance(String(account.initialBalance));
    setErrorMessage(undefined);
    setIsEditing(true);
  }

  function closeEditor() {
    if (isPending) return;
    setErrorMessage(undefined);
    setIsEditing(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || submitting.current || !account.isOwner) return;

    const trimmedName = name.trim();
    const parsedInitialBalance = Number(
      trimmedInitialBalance.replace(",", "."),
    );
    if (!trimmedName || !isInitialBalanceValid) return;

    const data = {
      ...(trimmedName !== account.name && { name: trimmedName }),
      ...(parsedInitialBalance !== account.initialBalance && {
        initialBalance: parsedInitialBalance,
      }),
    };

    if (Object.keys(data).length === 0) {
      setIsEditing(false);
      return;
    }

    submitting.current = true;
    setIsPending(true);
    setErrorMessage(undefined);
    try {
      await updateAccount(account.id, data, () => origin.current.active);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить изменения. Попробуйте ещё раз.",
      );
    } finally {
      submitting.current = false;
      setIsPending(false);
    }
  }

  return (
    <FormBlock
      legend="Настройки выбранного аккаунта"
      className={styles.panel}
      onSubmit={handleSubmit}
    >
      {isEditing ? (
        <>
          <label className={styles.field}>
            <span className={styles.label}>Название аккаунта</span>
            <input
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeEditor();
              }}
              autoFocus
              disabled={isPending}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Начальный баланс</span>
            <input
              className={styles.input}
              value={initialBalance}
              onChange={(event) => setInitialBalance(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeEditor();
              }}
              inputMode="decimal"
              aria-label="Начальный баланс"
              placeholder="Начальный баланс"
              disabled={isPending}
            />
          </label>
          <div className={styles.actions}>
            <button
              type="submit"
              disabled={isPending || !name.trim() || !isInitialBalanceValid}
            >
              Сохранить
            </button>
            <button type="button" onClick={closeEditor} disabled={isPending}>
              Отмена
            </button>
          </div>
          {isPending && (
            <p role="status" aria-label="Сохранение изменений счёта">
              Сохранение...
            </p>
          )}
          {errorMessage && <p role="alert">{errorMessage}</p>}
        </>
      ) : (
        <>
          <dl className={styles.details}>
            <div className={styles.row}>
              <dt className={styles.label}>Название</dt>
              <dd className={styles.value}>{account.name}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>Начальный баланс</dt>
              <dd className={styles.value}>
                {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                }).format(account.initialBalance)}
              </dd>
            </div>
          </dl>
          {account.isOwner ? (
            <button
              type="button"
              className={styles.editButton}
              onClick={openEditor}
            >
              Изменить
            </button>
          ) : (
            <p className={styles.note}>Редактировать может только владелец.</p>
          )}
        </>
      )}
    </FormBlock>
  );
}
