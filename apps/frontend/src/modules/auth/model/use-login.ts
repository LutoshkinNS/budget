import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { fetcher } from "@/common/api/fetcher.ts";
import { authLogin } from "@/common/api/generate/authentication/authentication.gen.ts";
import {
  AuthLoginBody,
  AuthLoginResponse,
} from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import { getSessionContext, type SessionToken } from "@/modules/user";

import type { LoginData } from "./types.ts";

type LoginOwner = {
  active: boolean;
  token: SessionToken | null;
};

export type LoginResult =
  | { status: "accepted"; token: SessionToken }
  | { status: "failed"; error: Error }
  | { status: "obsolete" };

function asError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "object" && value !== null && "message" in value) {
    return new Error(String(value.message));
  }
  return new Error("Не удалось войти в аккаунт");
}

function isSuccessfulResponse(value: unknown): boolean {
  const result = AuthLoginResponse.safeParse(value);
  return result.success && result.data.success;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const session = getSessionContext(queryClient);
  const ownerRef = useRef<LoginOwner | null>(null);
  const lockRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mutation = useMutation({
    mutationFn: ({ data }: { data: LoginData }) =>
      authLogin({
        id: data.id,
        first_name: data.first_name,
        auth_date: data.auth_date,
        hash: data.hash,
        ...(data.last_name === undefined ? {} : { last_name: data.last_name }),
        ...(data.username === undefined ? {} : { username: data.username }),
        ...(data.photo_url === undefined ? {} : { photo_url: data.photo_url }),
      }),
    retry: false,
    meta: { localFeedback: true },
  });

  useEffect(() => {
    const owner: LoginOwner = { active: true, token: null };
    ownerRef.current = owner;
    return () => {
      owner.active = false;
      if (owner.token) {
        session.apply(owner.token, { type: "login-abandoned" });
      }
      if (ownerRef.current === owner) ownerRef.current = null;
    };
  }, [session]);

  async function runLogin(send: () => Promise<unknown>): Promise<LoginResult> {
    const owner = ownerRef.current;
    if (!owner?.active || lockRef.current) return { status: "obsolete" };

    lockRef.current = true;
    setIsPending(true);
    setError(null);
    const token = session.beginCommand("login");
    owner.token = token;

    try {
      await queryClient.cancelQueries();
      if (!owner.active || !session.isCurrent(token)) {
        return { status: "obsolete" };
      }
      queryClient.removeQueries();
      if (!owner.active || !session.isCurrent(token)) {
        return { status: "obsolete" };
      }

      const response = await send();
      if (!owner.active || !session.isCurrent(token)) {
        return { status: "obsolete" };
      }
      if (!isSuccessfulResponse(response)) {
        throw new Error("Некорректный ответ сервера авторизации");
      }
      const acceptedToken = session.apply(token, { type: "login-success" });
      if (!acceptedToken) return { status: "obsolete" };
      owner.token = null;
      return { status: "accepted", token: acceptedToken };
    } catch (cause) {
      if (!owner.active || !session.isCurrent(token)) {
        return { status: "obsolete" };
      }
      const failure = asError(cause);
      const currentToken = session.apply(token, { type: "login-failure" });
      owner.token = null;
      setError(failure);
      return currentToken
        ? { status: "failed", error: failure }
        : { status: "obsolete" };
    } finally {
      lockRef.current = false;
      if (owner.active && ownerRef.current === owner) setIsPending(false);
    }
  }

  async function login(data: LoginData): Promise<LoginResult> {
    const validation = AuthLoginBody.safeParse(data);
    if (!validation.success) {
      const failure = new Error(z.prettifyError(validation.error));
      setError(failure);
      return { status: "failed", error: failure };
    }
    return runLogin(() => mutation.mutateAsync({ data: validation.data }));
  }

  async function devLogin(): Promise<LoginResult> {
    return runLogin(() =>
      fetcher<unknown>(
        "/api/v1/auth/dev-login",
        { method: "GET" },
        { refreshUnauthorized: false },
      ),
    );
  }

  return { login, devLogin, isPending, error };
}
