import { useCurrentAccountId } from "@/modules/user";

export type AccountScopedQuery = {
  queryKey?: readonly unknown[];
  enabled: boolean;
};

export function useAccountScopedQuery(
  buildKey: (accountId: number) => readonly unknown[],
  extraEnabled = true,
): AccountScopedQuery {
  const accountId = useCurrentAccountId();

  return {
    // exactOptionalPropertyTypes запрещает queryKey: undefined.
    ...(accountId !== undefined && { queryKey: buildKey(accountId) }),
    enabled: accountId != null && extraEnabled,
  };
}
