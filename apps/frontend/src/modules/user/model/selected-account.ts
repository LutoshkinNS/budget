import { useSyncExternalStore } from "react";
import type { QueryClient } from "@tanstack/react-query";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthMeResponse } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import type { UserInfoDTO } from "@/common/api/generate/model";
import { accountKeys } from "@/common/api/query-keys";

import { getSessionContext } from "./session-context.ts";
import { useMe } from "./use-me.ts";

const STORAGE_KEY = "budget.selected-account";

type AccountListener = () => void;

const listeners = new Set<AccountListener>();

let selectedAccountId: number | null | undefined;

function readStoredAccountId(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const id = raw === null ? Number.NaN : Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function getSelectedAccountId(): number | null {
  if (selectedAccountId === undefined) {
    selectedAccountId = readStoredAccountId();
  }
  return selectedAccountId;
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

function readMeAccounts(
  queryClient: QueryClient,
): UserInfoDTO["accounts"] | undefined {
  const snapshot = getSessionContext(queryClient).getSnapshot();
  if (
    (snapshot.phase !== "authenticated" &&
      snapshot.phase !== "logout-pending") ||
    snapshot.actorId === null
  ) {
    return undefined;
  }
  const me = readAdmittedMe(queryClient);
  return me?.userId === snapshot.actorId ? me.accounts : undefined;
}

function readAdmittedMe(queryClient: QueryClient): UserInfoDTO | undefined {
  const me: unknown = queryClient.getQueryData(getAuthMeQueryKey());
  const validation = AuthMeResponse.safeParse(me);
  return validation.success ? validation.data : undefined;
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
  const stored = useSyncExternalStore((onStoreChange) => {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
  }, getSelectedAccountId);
  return resolveAccountId(me?.accounts ?? [], stored);
}

/** Снимок accountId при вызове сохраняет область инвалидации после переключения. */
export function getCurrentAccountIdSnapshot(
  queryClient: QueryClient,
): number | undefined {
  return resolveAccountId(
    readMeAccounts(queryClient) ?? [],
    getSelectedAccountId(),
  );
}

/** Снимок нужен для отбрасывания поздних callback после смены пользователя. */
export function getCurrentUserIdSnapshot(
  queryClient: QueryClient,
): number | undefined {
  const snapshot = getSessionContext(queryClient).getSnapshot();
  if (
    (snapshot.phase !== "authenticated" &&
      snapshot.phase !== "logout-pending") ||
    snapshot.actorId === null
  ) {
    return undefined;
  }
  return readAdmittedMe(queryClient)?.userId === snapshot.actorId
    ? snapshot.actorId
    : undefined;
}

export function requireCurrentAccountId(queryClient: QueryClient): number {
  const accountId = getCurrentAccountIdSnapshot(queryClient);
  if (accountId === undefined) {
    throw new Error("Текущий счёт не определён");
  }
  return accountId;
}

/** Покинутое поддерево сверяется при возврате, без фонового рефетча. */
export function switchAccount(queryClient: QueryClient, accountId: number) {
  const previousAccountId = getCurrentAccountIdSnapshot(queryClient);
  if (previousAccountId === accountId) return;
  if (!persistAccountId(accountId)) return;
  selectedAccountId = accountId;

  notifyListeners();

  if (previousAccountId !== undefined) {
    void queryClient.invalidateQueries({
      queryKey: accountKeys.root(previousAccountId),
      refetchType: "none",
    });
  }
}
