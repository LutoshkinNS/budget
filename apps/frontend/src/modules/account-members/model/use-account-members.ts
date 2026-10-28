import { useAccountsListMembers } from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsListMembersResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";
import { useCurrentAccountId } from "@/modules/user";

import { memberKeys } from "./member-keys.ts";

export function useAccountMembers() {
  const accountId = useCurrentAccountId();
  // Placeholder безопасен при отключённом запросе.
  const query = useAccountsListMembers(accountId ?? 1, {
    query: {
      // exactOptionalPropertyTypes запрещает queryKey: undefined.
      ...(accountId !== undefined && { queryKey: memberKeys.all(accountId) }),
      enabled: accountId != null,
    },
  });
  const { data, isError } = query;

  const validation = AccountsListMembersResponse.safeParse(data);
  const hasValidData = data !== undefined && validation.success;
  const hasInvalidData = data !== undefined && !validation.success;

  return {
    data: hasValidData ? validation.data : [],
    hasAccount: accountId != null,
    hasValidData,
    isLoading: accountId != null && query.isLoading,
    isError: isError || hasInvalidData,
  };
}
