import { useSyncExternalStore } from "react";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import type { UserInfoDTO } from "@/common/api/generate/model";
import { accountKeys } from "@/common/api/query-keys";

import { useMe } from "./useMe.ts";

const STORAGE_KEY = "budget.selected-account";

type AccountListener = () => void;

const listeners = new Set<AccountListener>();

function readSelectedAccountId(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const id = raw === null ? Number.NaN : Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function persistAccountId(accountId: number): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(accountId));
    return true;
  } catch {
    return false;
  }
}

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function readMeAccounts(): UserInfoDTO["accounts"] | undefined {
  return queryClient.getQueryData<UserInfoDTO>(getAuthMeQueryKey())?.accounts;
}

function resolveAccountId(
  accounts: UserInfoDTO["accounts"],
  stored: number | null,
): number | undefined {
  if (accounts.length === 0) return undefined;
  if (stored !== null && accounts.some((account) => account.id === stored)) {
    return stored;
  }
  return accounts[0]?.id;
}

export function useCurrentAccountId(): number | undefined {
  const { data: me } = useMe();
  const stored = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => readSelectedAccountId(),
  );
  return resolveAccountId(me?.accounts ?? [], stored);
}

/** Снимок accountId при вызове сохраняет область инвалидации после переключения. */
export function getCurrentAccountIdSnapshot(): number | undefined {
  return resolveAccountId(readMeAccounts() ?? [], readSelectedAccountId());
}

export function requireCurrentAccountId(): number {
  const accountId = getCurrentAccountIdSnapshot();
  if (accountId === undefined) {
    throw new Error("Текущий счёт не определён");
  }
  return accountId;
}

/** Покинутое поддерево сверяется при возврате, без фонового рефетча. */
export function switchAccount(accountId: number) {
  const previousAccountId = getCurrentAccountIdSnapshot();
  if (previousAccountId === accountId) return;
  if (!persistAccountId(accountId)) return;

  notifyListeners();

  if (previousAccountId !== undefined) {
    void queryClient.invalidateQueries({
      queryKey: accountKeys.root(previousAccountId),
      refetchType: "none",
    });
  }
}
