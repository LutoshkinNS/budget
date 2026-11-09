import { queryClient } from "@/common/api/app-query.ts";
import {
  getAccountsListQueryKey,
  useAccountsUpdate,
} from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsUpdateResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthMeResponse } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import type { AccountUpdateDTO } from "@/common/api/generate/model";
import { invalidateTransactionSummary } from "@/modules/transactions";
import { getSessionContext } from "@/modules/user";

export function useUpdateAccount() {
  function reconcileAuthMe() {
    void queryClient.invalidateQueries(
      { queryKey: getAuthMeQueryKey(), exact: true },
      { cancelRefetch: false },
    );
  }

  function invalidateAccountScope(accountId: number) {
    void queryClient.invalidateQueries({
      queryKey: getAccountsListQueryKey(),
    });
    void invalidateTransactionSummary(accountId);
  }

  const managedMutation = useAccountsUpdate({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAccountScope(variables.accountId);
      },
      meta: { localFeedback: true },
    },
  });
  const legacyMutation = useAccountsUpdate({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAccountScope(variables.accountId);
        void queryClient.invalidateQueries({
          queryKey: getAuthMeQueryKey(),
        });
      },
      meta: { localFeedback: true },
    },
  });

  const { mutate: rawMutate, ...rest } = legacyMutation;
  const mutate = (
    accountId: number,
    data: AccountUpdateDTO,
    options?: Parameters<typeof rawMutate>[1],
  ) => rawMutate({ accountId, data }, options);
  const { mutateAsync: managedMutateAsync } = managedMutation;

  const updateAccount = async (
    accountId: number,
    data: AccountUpdateDTO,
    isOriginCurrent: () => boolean,
  ) => {
    const session = getSessionContext(queryClient);
    const token = session.captureRead();
    const snapshot = session.getSnapshot();
    const cachedMe = AuthMeResponse.safeParse(
      queryClient.getQueryData(getAuthMeQueryKey()),
    );

    if (
      !token ||
      snapshot.actorId === null ||
      (snapshot.phase !== "authenticated" &&
        snapshot.phase !== "logout-pending") ||
      !cachedMe.success ||
      cachedMe.data.userId !== snapshot.actorId ||
      !cachedMe.data.accounts.some(
        (account) => account.id === accountId && account.isOwner,
      )
    ) {
      throw new Error("Не удалось обновить данные счёта");
    }

    const response = await managedMutateAsync({ accountId, data });
    const parsedResponse = AccountsUpdateResponse.safeParse(response);
    if (!parsedResponse.success || parsedResponse.data.id !== accountId) {
      throw new Error("Не удалось обновить данные счёта");
    }

    if (!session.isCurrent(token)) {
      return response;
    }
    if (!isOriginCurrent()) {
      reconcileAuthMe();
      return response;
    }

    await queryClient.cancelQueries({
      queryKey: getAuthMeQueryKey(),
      exact: true,
    });

    if (!session.isCurrent(token)) {
      return response;
    }
    if (!isOriginCurrent()) {
      reconcileAuthMe();
      return response;
    }

    queryClient.setQueryData(getAuthMeQueryKey(), (current: unknown) => {
      const parsedMe = AuthMeResponse.safeParse(current);
      if (
        !parsedMe.success ||
        parsedMe.data.userId !== snapshot.actorId ||
        !parsedMe.data.accounts.some(
          (account) => account.id === accountId && account.isOwner,
        )
      ) {
        return current;
      }

      return {
        ...parsedMe.data,
        accounts: parsedMe.data.accounts.map((account) =>
          account.id === accountId
            ? {
                ...account,
                name: parsedResponse.data.name,
                initialBalance: parsedResponse.data.initialBalance,
              }
            : account,
        ),
      };
    });

    reconcileAuthMe();

    return response;
  };

  return { ...rest, mutate, updateAccount };
}
