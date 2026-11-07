import { useMemo, useSyncExternalStore } from "react";
import { CancelledError, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  authMe,
  getAuthMeQueryKey,
} from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthMeResponse } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import type { UserInfoDTO } from "@/common/api/generate/model";

import {
  getSessionContext,
  type SessionContext,
  type SessionToken,
} from "./session-context.ts";

function invalidAuthMeError(): Error {
  return new Error("Некорректные данные авторизации");
}

export function useMe() {
  const queryClient = useQueryClient();
  const session = getSessionContext(queryClient);
  const sessionSnapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const query = useQuery<UserInfoDTO, Error>({
    queryKey: getAuthMeQueryKey(),
    enabled:
      sessionSnapshot.phase !== "login-pending",
    queryFn: async ({ signal }) => {
      const token = session.captureRead();
      if (!token || signal.aborted) throw new CancelledError();

      try {
        const response = await authMe({ signal });
        if (signal.aborted || !session.isCurrent(token)) {
          throw new CancelledError();
        }
        const validation = AuthMeResponse.safeParse(response);
        if (!validation.success) throw invalidAuthMeError();

        const previousLifetime = session.getSnapshot().privateLifetime;
        const accepted = session.apply(token, {
          type: "me-valid",
          actorId: validation.data.userId,
        });
        if (!accepted) throw new CancelledError();
        if (session.getSnapshot().privateLifetime !== previousLifetime) {
          await retirePrivateQueries(queryClient, accepted, session, signal);
          if (signal.aborted || !session.isCurrent(accepted)) {
            throw new CancelledError();
          }
        }
        return validation.data;
      } catch (error) {
        if (signal.aborted || !session.isCurrent(token)) {
          throw new CancelledError();
        }
        if (isUnauthorizedError(error)) {
          const accepted = session.apply(token, { type: "me-unauthorized" });
          if (accepted) {
            await retirePrivateQueries(queryClient, accepted, session, signal);
            if (signal.aborted || !session.isCurrent(accepted)) {
              throw new CancelledError();
            }
            throw error;
          }
          throw new CancelledError();
        }
        throw error;
      }
    },
    retry: false,
  });

  const validation = useMemo(
    () => AuthMeResponse.safeParse(query.data),
    [query.data],
  );
  const admittedData = validation.success ? validation.data : null;
  const data =
    admittedData &&
    sessionSnapshot.actorId === admittedData.userId &&
    sessionSnapshot.phase !== "anonymous" &&
    sessionSnapshot.phase !== "login-pending"
      ? admittedData
      : null;
  const invalidCachedData = query.data !== undefined && !validation.success;
  const error = query.error ?? (invalidCachedData ? invalidAuthMeError() : null);
  const isError = query.isError || invalidCachedData;

  return {
    ...query,
    data,
    error,
    isError,
    isUnauthorized: isUnauthorizedError(error),
    hasValidData: data !== null,
    privateLifetime: sessionSnapshot.privateLifetime,
    isLoading: data === null && query.isLoading && !isError,
  };
}

async function retirePrivateQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  token: SessionToken,
  session: SessionContext,
  signal: AbortSignal,
) {
  const meQueryKey = JSON.stringify(getAuthMeQueryKey());
  const isPrivateQuery = (query: { queryKey: readonly unknown[] }) =>
    JSON.stringify(query.queryKey) !== meQueryKey;
  await queryClient.cancelQueries({ predicate: isPrivateQuery });
  if (signal.aborted || !session.isCurrent(token)) throw new CancelledError();
  queryClient.removeQueries({ predicate: isPrivateQuery });
  if (signal.aborted || !session.isCurrent(token)) throw new CancelledError();
}

function isUnauthorizedError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    error.statusCode === 401
  );
}
