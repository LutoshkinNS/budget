import { useState } from "react";

import type { AccountUpdateDTO } from "@/common/api/generate/model";
import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useMe } from "@/modules/user";

import { useUpdateAccount } from "../model/useUpdateAccount.ts";

import s from "./RenameAccount.module.css";

export function RenameAccount() {
  const { data: me } = useMe();
  const currentAccount = me?.accounts.find(
    (account) => account.id === me.currentAccountId,
  );
  const { mutate, isPending } = useUpdateAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const trimmedInitialBalance = initialBalance.trim();
  const isInitialBalanceValid =
    trimmedInitialBalance.length > 0 &&
    Number.isFinite(Number(trimmedInitialBalance.replace(",", ".")));

  const handleEdit = () => {
    if (!currentAccount?.isOwner) return;

    setIsEditing(true);
    setName(currentAccount.name);
    setInitialBalance(String(currentAccount.initialBalance));
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const parsedInitialBalance = Number(
      trimmedInitialBalance.replace(",", "."),
    );

    if (!currentAccount) {
      setIsEditing(false);
      return;
    }

    if (!trimmedName) {
      return;
    }

    if (!isInitialBalanceValid) {
      return;
    }

    const data = {
      ...(trimmedName &&
        trimmedName !== currentAccount.name && { name: trimmedName }),
      ...(parsedInitialBalance !== currentAccount.initialBalance && {
        initialBalance: parsedInitialBalance,
      }),
    } satisfies AccountUpdateDTO;

    if (Object.keys(data).length === 0) {
      setIsEditing(false);
      return;
    }

    mutate(currentAccount.id, data, { onSuccess: () => setIsEditing(false) });
  };

  if (!currentAccount) return null;

  return (
    <FormBlock legend="Настройки выбранного аккаунта">
      <div className={s.panel}>
        {isEditing ? (
          <>
            <label className={s.field}>
              <span className={s.label}>Название аккаунта</span>
              <input
                className={s.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
                disabled={isPending}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Начальный баланс</span>
              <input
                className={s.input}
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                inputMode="decimal"
                aria-label="Начальный баланс"
                placeholder="Начальный баланс"
                disabled={isPending}
              />
            </label>
            <div className={s.actions}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !name.trim() || !isInitialBalanceValid}
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                Отмена
              </button>
            </div>
          </>
        ) : (
          <>
            <dl className={s.details}>
              <div className={s.row}>
                <dt className={s.label}>Название</dt>
                <dd className={s.value}>{currentAccount.name}</dd>
              </div>
              <div className={s.row}>
                <dt className={s.label}>Начальный баланс</dt>
                <dd className={s.value}>
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                  }).format(currentAccount.initialBalance)}
                </dd>
              </div>
            </dl>
            {currentAccount.isOwner ? (
              <button
                type="button"
                className={s.editButton}
                onClick={handleEdit}
              >
                Изменить
              </button>
            ) : (
              <p className={s.note}>Редактировать может только владелец.</p>
            )}
          </>
        )}
      </div>
    </FormBlock>
  );
}
