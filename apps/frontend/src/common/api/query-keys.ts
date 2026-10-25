/** Маркер счёта задаёт префикс для изоляции его кэша. */
export const ACCOUNT_KEY_MARKER = "account" as const;

export const accountKeys = {
  root: (accountId: number) => [ACCOUNT_KEY_MARKER, accountId] as const,
  all: () => [ACCOUNT_KEY_MARKER] as const,
};
