import { useState } from "react";

import { useUpdateAccount } from "@/entities/accounts";
import { useMe } from "@/entities/user";
import { FormBlock } from "@/shared/ui/form-block";

export function RenameAccount() {
  const { data: me } = useMe();
  const ownedAccounts = me?.accounts.filter((a) => a.isOwner) ?? [];
  const { mutate, isPending } = useUpdateAccount();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  const handleEdit = (accountId: number, currentName: string) => {
    setEditingId(accountId);
    setName(currentName);
  };

  const handleSubmit = (accountId: number) => {
    if (
      !name.trim() ||
      name === me?.accounts.find((a) => a.id === accountId)?.name
    ) {
      setEditingId(null);
      return;
    }
    mutate(accountId, { name: name.trim() }, { onSuccess: () => setEditingId(null) });
  };

  if (ownedAccounts.length === 0) return null;

  return (
    <FormBlock legend="Переименовать аккаунт">
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
              <button type="button"
                onClick={() => handleSubmit(account.id)}
                disabled={isPending || !name.trim()}
              >
                Сохранить
              </button>
              <button type="button" onClick={() => setEditingId(null)} disabled={isPending}>
                Отмена
              </button>
            </div>
          ) : (
            <div>
              <span>{account.name}</span>
              <button type="button" onClick={() => handleEdit(account.id, account.name)}>
                Переименовать
              </button>
            </div>
          )}
        </div>
      ))}
    </FormBlock>
  );
}
