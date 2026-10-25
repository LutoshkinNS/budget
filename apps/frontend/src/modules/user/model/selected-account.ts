import { useSyncExternalStore } from "react";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import type { UserInfoDTO } from "@/common/api/generate/model";
import { accountKeys } from "@/common/api/query-keys";

import { useMe } from "./useMe.ts";

const STORAGE_KEY = "budget.selected-account";

type AccountListener = () => void;

const listeners = new Set<AccountListener>();

/**
 * Выбранный счёт — локальное состояние устройства (localStorage), а не часть
 * серверной сессии: смысл каждого запроса задаёт его собственный accountId,
 * поэтому переключение не требует HTTP и не затрагивает другие вкладки.
 * localStorage — единственное хранилище выбора; недоступное хранилище
 * оставляет приложение на первом счёте списка me.accounts.
 */
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

/**
 * Сохранённый счёт валидируется по списку me.accounts: протухший выбор
 * (например, после выхода из приглашённого счёта) откатывается к первому.
 */
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

/**
 * Синхронное чтение текущего счёта вне React: снапшот снимается в момент
 * вызова мутации и задаёт её неизменяемый скоп — позднее переключение счёта
 * не меняет ни выполнение запроса, ни область инвалидаций.
 */
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

/**
 * Локальное переключение счёта: без HTTP и без отмены летящих запросов —
 * их смысл зафиксирован собственным accountId. Прежнее поддерево кэша
 * помечается устаревшим без фонового рефетча: сверка случится при возврате.
 */
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
