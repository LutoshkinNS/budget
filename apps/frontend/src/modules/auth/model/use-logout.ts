import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getAuthMeQueryKey,
  useAuthLogout,
} from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthLogoutResponse } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import { getSessionContext, type SessionToken } from "@/modules/user";

export type LogoutResult =
  | { status: "accepted"; token: SessionToken }
  | { status: "failed"; error: Error }
  | { status: "obsolete" };

function asError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "object" && value !== null && "message" in value) {
    return new Error(String(value.message));
  }
  return new Error("Не удалось выйти из аккаунта");
}

export function useLogout() {
  const queryClient = useQueryClient();
  const session = getSessionContext(queryClient);
  const lockRef = useRef(false);
  const ownerRef = useRef<{ active: boolean } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mutation = useAuthLogout({
    mutation: {
      retry: false,
      meta: { localFeedback: true },
    },
  });

  useEffect(() => {
    const owner = { active: true };
    ownerRef.current = owner;
    return () => {
      owner.active = false;
      if (ownerRef.current === owner) ownerRef.current = null;
    };
  }, []);

  async function logout(): Promise<LogoutResult> {
    const owner = ownerRef.current;
    if (!owner?.active || lockRef.current) return { status: "obsolete" };
    lockRef.current = true;
    setIsPending(true);
    setError(null);
    const token = session.beginCommand("logout");

    try {
      await queryClient.cancelQueries({ queryKey: getAuthMeQueryKey() });
      if (!session.isCurrent(token)) return { status: "obsolete" };

      const response = await mutation.mutateAsync();
      if (!session.isCurrent(token)) return { status: "obsolete" };
      const validation = AuthLogoutResponse.safeParse(response);
      if (!validation.success || !validation.data.success) {
        throw new Error("Некорректный ответ сервера выхода");
      }

      const acceptedToken = session.apply(token, { type: "logout-success" });
      if (!acceptedToken) return { status: "obsolete" };
      queryClient.clear();
      return { status: "accepted", token: acceptedToken };
    } catch (cause) {
      if (!session.isCurrent(token)) return { status: "obsolete" };
      const failure = asError(cause);
      const acceptedToken = session.apply(token, { type: "logout-failure" });
      if (!acceptedToken) return { status: "obsolete" };
      if (owner.active && ownerRef.current === owner) setError(failure);
      return { status: "failed", error: failure };
    } finally {
      lockRef.current = false;
      if (owner.active && ownerRef.current === owner) setIsPending(false);
    }
  }

  return { logout, isPending, error };
}
