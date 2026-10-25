import { accountKeys } from "@/common/api/query-keys";

/**
 * Ключи участников счёта: семейство целиком живёт на уровне
 * ['account', accountId, 'members'] — других форм (list/detail) у
 * members-эндпоинта нет, поэтому фабрика ограничена корнем семейства.
 */
export const memberKeys = {
  all: (accountId: number) =>
    [...accountKeys.root(accountId), "members"] as const,
};
