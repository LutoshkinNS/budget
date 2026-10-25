/** Маркер account-скопа: префиксная инвалидация накрывает поддерево одного счёта. */
export const ACCOUNT_KEY_MARKER = "account" as const;

/**
 * Чистая инфраструктура ключей; чтение authMe-контекста живёт в модуле user.
 */
export const accountKeys = {
  root: (accountId: number) => [ACCOUNT_KEY_MARKER, accountId] as const,
  // Fallback-инвалидация, когда счёт в момент вызова неизвестен
  all: () => [ACCOUNT_KEY_MARKER] as const,
};
