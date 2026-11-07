import {
  accountsListMembers,
  useAccountsListMembers,
} from "@/common/api/generate/accounts/accounts.gen.ts";
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
      queryFn: async ({ signal }) => {
        const data = await accountsListMembers(accountId ?? 1, { signal });
        const validation = AccountsListMembersResponse.safeParse(data);

        if (!validation.success) {
          throw new Error("Invalid account members response");
        }

        return validation.data.map((member) => ({
          userId: member.userId,
          ...(member.firstName !== undefined
            ? { firstName: member.firstName }
            : {}),
          ...(member.photoUrl !== undefined
            ? { photoUrl: member.photoUrl }
            : {}),
        }));
      },
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
    isFetching: query.isFetching,
    isLoading: accountId != null && query.isLoading,
    isError: isError || hasInvalidData,
    refetch: query.refetch,
  };
}
