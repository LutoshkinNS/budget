import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthMeResponse } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import type { UserInfoDTO } from "@/common/api/generate/model";

export type SessionPhase =
  | "unresolved"
  | "authenticated"
  | "login-pending"
  | "logout-pending"
  | "anonymous";

export type SessionToken = Readonly<{ revision: number }>;

export type SessionSnapshot = Readonly<{
  token: SessionToken;
  actorId: number | null;
  phase: SessionPhase;
  privateLifetime: number;
}>;

export type SessionEvent =
  | { type: "me-valid"; actorId: number }
  | { type: "me-unauthorized" }
  | { type: "login-success" }
  | { type: "login-failure" }
  | { type: "login-abandoned" }
  | { type: "logout-success" }
  | { type: "logout-failure" };

export type SessionContext = {
  getSnapshot(): SessionSnapshot;
  subscribe(listener: () => void): () => void;
  captureRead(): SessionToken | null;
  beginCommand(command: "login" | "logout"): SessionToken;
  apply(token: SessionToken, event: SessionEvent): SessionToken | null;
  isCurrent(token: SessionToken): boolean;
};

const contexts = new WeakMap<QueryClient, SessionContext>();

function readValidMe(queryClient: QueryClient): UserInfoDTO | undefined {
  const value: unknown = queryClient.getQueryData(getAuthMeQueryKey());
  const result = AuthMeResponse.safeParse(value);
  return result.success ? result.data : undefined;
}

export function getSessionContext(queryClient: QueryClient): SessionContext {
  const existing = contexts.get(queryClient);
  if (existing) return existing;

  let currentToken: SessionToken = Object.freeze({ revision: 0 });
  const cachedMe = readValidMe(queryClient);
  let snapshot: SessionSnapshot = Object.freeze({
    token: currentToken,
    actorId: cachedMe?.userId ?? null,
    phase: cachedMe ? "authenticated" : "unresolved",
    privateLifetime: 0,
  });
  let pristine = true;
  const listeners = new Set<() => void>();

  function publish(
    actorId: number | null,
    phase: SessionPhase,
    privateLifetime = snapshot.privateLifetime,
    revision = snapshot.token.revision,
  ): SessionToken {
    if (revision !== currentToken.revision) {
      currentToken = Object.freeze({ revision });
    }
    snapshot = Object.freeze({
      token: currentToken,
      actorId,
      phase,
      privateLifetime,
    });
    for (const listener of listeners) listener();
    return currentToken;
  }

  function bindCachedActor() {
    if (!pristine || snapshot.phase !== "unresolved") return;
    const me = readValidMe(queryClient);
    if (me) publish(me.userId, "authenticated");
  }

  const context: SessionContext = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      bindCachedActor();
      listeners.add(listener);
      const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
        if (!pristine) return;
        const queryKey: QueryKey | undefined = event.query?.queryKey;
        if (JSON.stringify(queryKey) !== JSON.stringify(getAuthMeQueryKey())) {
          return;
        }
        const me = readValidMe(queryClient);
        if (me) context.apply(currentToken, { type: "me-valid", actorId: me.userId });
      });
      return () => {
        listeners.delete(listener);
        unsubscribeCache();
      };
    },
    captureRead() {
      bindCachedActor();
      if (snapshot.phase === "login-pending") {
        return null;
      }
      pristine = false;
      return currentToken;
    },
    beginCommand(command) {
      bindCachedActor();
      pristine = false;
      const revision = currentToken.revision + 1;
      if (command === "login") {
        return publish(
          null,
          "login-pending",
          snapshot.privateLifetime + 1,
          revision,
        );
      }
      return publish(snapshot.actorId, "logout-pending", undefined, revision);
    },
    apply(token, event) {
      if (token !== currentToken) return null;
      pristine = false;

      switch (event.type) {
        case "me-valid": {
          if (snapshot.phase === "login-pending") return null;
          if (snapshot.phase === "logout-pending") {
            if (snapshot.actorId === event.actorId) return currentToken;
            return publish(
              event.actorId,
              "authenticated",
              snapshot.privateLifetime + 1,
              currentToken.revision + 1,
            );
          }
          if (snapshot.phase === "unresolved") {
            return publish(event.actorId, "authenticated");
          }
          if (snapshot.phase === "anonymous") {
            return publish(
              event.actorId,
              "authenticated",
              snapshot.privateLifetime + 1,
              currentToken.revision + 1,
            );
          }
          if (snapshot.actorId === event.actorId) return currentToken;
          return publish(
            event.actorId,
            "authenticated",
            snapshot.privateLifetime + 1,
            currentToken.revision + 1,
          );
        }
        case "me-unauthorized":
          if (snapshot.phase === "anonymous") return currentToken;
          return publish(
            null,
            "anonymous",
            snapshot.privateLifetime + 1,
            currentToken.revision + 1,
          );
        case "login-success":
          if (snapshot.phase !== "login-pending") return null;
          return publish(null, "unresolved");
        case "login-failure":
          if (snapshot.phase !== "login-pending") return null;
          return publish(null, "unresolved");
        case "login-abandoned":
          if (snapshot.phase !== "login-pending") return null;
          return publish(
            null,
            "anonymous",
            undefined,
            currentToken.revision + 1,
          );
        case "logout-success":
          if (snapshot.phase !== "logout-pending") return null;
          return publish(
            null,
            "anonymous",
            snapshot.privateLifetime + 1,
            currentToken.revision + 1,
          );
        case "logout-failure":
          if (snapshot.phase !== "logout-pending" || snapshot.actorId === null) {
            return null;
          }
          return publish(
            snapshot.actorId,
            "authenticated",
          );
      }
    },
    isCurrent: (token) => token === currentToken,
  };

  contexts.set(queryClient, context);
  return context;
}
