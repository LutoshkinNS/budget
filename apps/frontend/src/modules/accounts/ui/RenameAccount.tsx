import { useState } from "react";

import type { AccountUpdateDTO } from "@/common/api/generate/model";
import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useMe } from "@/modules/user";

import { useUpdateAccount } from "../model/useUpdateAccount.ts";

export function RenameAccount() {
  const { data: me } = useMe();
  const ownedAccounts = me?.accounts.filter((a) => a.isOwner) ?? [];
  const { mutate, isPending } = useUpdateAccount();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const trimmedInitialBalance = initialBalance.trim();
  const isInitialBalanceValid =
    trimmedInitialBalance.length > 0 &&
    Number.isFinite(Number(trimmedInitialBalance.replace(",", ".")));

  const handleEdit = (
    accountId: number,
    currentName: string,
    currentInitialBalance: number,
  ) => {
    setEditingId(accountId);
    setName(currentName);
    setInitialBalance(String(currentInitialBalance));
  };

  const handleSubmit = (accountId: number) => {
    const account = me?.accounts.find((a) => a.id === accountId);
    const trimmedName = name.trim();
    const parsedInitialBalance = Number(
      trimmedInitialBalance.replace(",", "."),
    );

    if (!account) {
      setEditingId(null);
      return;
    }

    if (!trimmedName) {
      setEditingId(null);
      return;
    }

    if (!isInitialBalanceValid) {
      return;
    }

    const data = {
      ...(trimmedName &&
        trimmedName !== account.name && { name: trimmedName }),
      ...(parsedInitialBalance !== account.initialBalance && {
        initialBalance: parsedInitialBalance,
      }),
    } satisfies AccountUpdateDTO;

    if (Object.keys(data).length === 0) {
      setEditingId(null);
      return;
    }

    mutate(accountId, data, { onSuccess: () => setEditingId(null) });
  };

  if (ownedAccounts.length === 0) return null;

  return (
    <FormBlock legend="Настройки аккаунта">
      {ownedAccounts.map((account) => (
        <div key={account.id}>
          {editingId === account.id ? (
            <div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(account.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                disabled={isPending}
              />
              <input
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(account.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                inputMode="decimal"
                aria-label="Начальный баланс"
                placeholder="Начальный баланс"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => handleSubmit(account.id)}
                disabled={isPending || !name.trim() || !isInitialBalanceValid}
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                disabled={isPending}
              >
                Отмена
              </button>
            </div>
          ) : (
            <div>
              <span>{account.name}</span>
              <span>
                {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                }).format(account.initialBalance)}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleEdit(account.id, account.name, account.initialBalance)
                }
              >
                Изменить
              </button>
            </div>
          )}
        </div>
      ))}
    </FormBlock>
  );
}
