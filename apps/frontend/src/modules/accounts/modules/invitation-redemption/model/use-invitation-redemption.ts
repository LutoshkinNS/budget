import { useCallback, useEffect, useRef, useState } from "react";
import { CancelledError, useQueryClient } from "@tanstack/react-query";

import {
  getAccountsListQueryKey,
  useAccountsRedeemInvitation,
} from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsRedeemInvitationResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { getSessionContext, type SessionToken, useMe } from "@/modules/user";

type Phase = "checking" | "redeeming" | "refreshing" | "error" | "complete";
type WorkflowOwner = {
  code: string;
  actorId: number | undefined;
  token: SessionToken | undefined;
  started: boolean;
};

export function useInvitationRedemption(code: string) {
  const queryClient = useQueryClient();
  const session = getSessionContext(queryClient);
  const {
    data: me,
    isLoading,
    isError,
    isUnauthorized,
    error,
    refetch,
  } = useMe();
  const mutation = useAccountsRedeemInvitation({ mutation: { retry: false } });
  const [phase, setPhase] = useState<Phase>("checking");
  const [message, setMessage] = useState<string>();
  const redeemedAccountId = useRef<number | undefined>(undefined);
  const completionOwner = useRef<WorkflowOwner | undefined>(undefined);
  const profileRetrying = useRef(false);
  const owner = useRef<WorkflowOwner>({
    code,
    actorId: undefined,
    token: undefined,
    started: false,
  });
  const mounted = useRef(false);

  const isApplicable = useCallback(
    (
      workflowOwner: WorkflowOwner,
      actorId: number,
      token: NonNullable<ReturnType<typeof session.captureRead>>,
    ) => {
      return (
        owner.current === workflowOwner &&
        workflowOwner.code === code &&
        workflowOwner.actorId === actorId &&
        workflowOwner.token === token &&
        mounted.current &&
        session.isCurrent(token) &&
        session.getSnapshot().actorId === actorId
      );
    },
    [code, session],
  );

  const startRedemption = useCallback(
    async (
      actorId: number,
      token: NonNullable<ReturnType<typeof session.captureRead>>,
    ) => {
      if (
        owner.current.code !== code ||
        owner.current.actorId !== actorId ||
        owner.current.token !== token
      ) {
        owner.current = {
          code,
          actorId,
          token,
          started: false,
        };
      }
      if (owner.current.started) return;
      const attemptOwner = owner.current;
      attemptOwner.started = true;
      setPhase("redeeming");
      setMessage(undefined);
      try {
        const response = await mutation.mutateAsync({ data: { code } });
        const result = AccountsRedeemInvitationResponse.safeParse(response);
        if (!result.success || result.data.code !== code) {
          throw new Error("Не удалось подтвердить приглашение.");
        }
        if (!isApplicable(attemptOwner, actorId, token)) return;
        redeemedAccountId.current = result.data.accountId;

        setPhase("refreshing");
        await queryClient.cancelQueries({
          queryKey: getAuthMeQueryKey(),
          exact: true,
        });
        if (!isApplicable(attemptOwner, actorId, token)) return;

        const refreshed = await refetch({ throwOnError: true });
        if (!isApplicable(attemptOwner, actorId, token)) return;
        const hasAccount = refreshed.data?.accounts.some(
          (account) => account.id === result.data.accountId,
        );
        if (!refreshed.isSuccess || !hasAccount) {
          throw new Error(
            "Приглашение принято, но обновить список счетов не удалось.",
          );
        }

        void queryClient.invalidateQueries({
          queryKey: getAccountsListQueryKey(),
        });
        if (!isApplicable(attemptOwner, actorId, token)) return;
        setPhase("complete");
        completionOwner.current = attemptOwner;
        return result.data.accountId;
      } catch (cause) {
        if (
          !isApplicable(attemptOwner, actorId, token) ||
          cause instanceof CancelledError
        )
          return;
        setMessage(
          cause instanceof Error
            ? cause.message
            : "Не удалось обработать приглашение.",
        );
        setPhase("error");
        attemptOwner.started = false;
        return undefined;
      }
    },
    [code, isApplicable, mutation, queryClient, refetch, session],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || isError || isUnauthorized || !me) return;
    const token = session.captureRead();
    if (!token) return;
    if (
      owner.current.code === code &&
      owner.current.actorId === me.userId &&
      owner.current.token === token
    ) {
      return;
    }
    owner.current = {
      code,
      actorId: me.userId,
      token,
      started: false,
    };
    redeemedAccountId.current = undefined;
    completionOwner.current = undefined;
    setMessage(undefined);
    setPhase("checking");
  }, [code, isError, isLoading, isUnauthorized, me, session]);

  useEffect(() => {
    if (phase !== "checking" || isUnauthorized || isLoading || !me) return;
    const token = session.captureRead();
    if (!token) return;
    void startRedemption(me.userId, token);
  }, [isError, isLoading, isUnauthorized, me, phase, session, startRedemption]);

  async function retryProfile() {
    const current = me;
    const token = session.captureRead();
    if (!current || !token || profileRetrying.current) return;
    const currentOwner = owner.current;
    profileRetrying.current = true;
    setMessage(undefined);
    setPhase("refreshing");
    try {
      const refreshed = await refetch({ throwOnError: true });
      if (!isApplicable(currentOwner, current.userId, token)) return;
      const accountId = redeemedAccountId.current;
      if (
        refreshed.isSuccess &&
        accountId !== undefined &&
        refreshed.data.accounts.some((account) => account.id === accountId)
      ) {
        completionOwner.current = currentOwner;
        setPhase("complete");
        return;
      }
      setMessage("Счёт ещё не появился в обновлённом профиле.");
      setPhase("error");
    } catch (cause) {
      if (isApplicable(currentOwner, current.userId, token)) {
        setMessage(
          cause instanceof Error
            ? cause.message
            : "Не удалось обновить профиль.",
        );
        setPhase("error");
      }
    } finally {
      profileRetrying.current = false;
    }
  }

  return {
    phase,
    message,
    isLoading,
    isError,
    isUnauthorized,
    hasUsableMe: me !== null,
    error,
    isRefreshError: redeemedAccountId.current !== undefined,
    isCompletionCurrent: () => {
      const completed = completionOwner.current;
      return (
        completed !== undefined &&
        completed.actorId !== undefined &&
        completed.token !== undefined &&
        isApplicable(completed, completed.actorId, completed.token)
      );
    },
    refetch,
    retry: () => {
      const current = me;
      const token = session.captureRead();
      if (!current || !token || owner.current.started) return;
      if (redeemedAccountId.current) {
        void retryProfile();
        return;
      }
      void startRedemption(current.userId, token);
    },
  };
}
