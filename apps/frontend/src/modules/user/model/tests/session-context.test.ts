import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { getSessionContext } from "../session-context";

const meKey = getAuthMeQueryKey();

describe("session lifetime", () => {
  it("binds cached actor before a command and keeps lifetime and authority on failed logout", () => {
    const client = new QueryClient();
    const session = getSessionContext(client);
    client.setQueryData(meKey, { userId: 1, accounts: [] });
    const firstLifetime = session.getSnapshot().privateLifetime;

    const logout = session.beginCommand("logout");

    expect(session.getSnapshot()).toMatchObject({
      actorId: 1,
      phase: "logout-pending",
      privateLifetime: firstLifetime,
    });
    expect(session.apply(logout, { type: "me-valid", actorId: 1 })).toBe(
      logout,
    );
    expect(session.getSnapshot().phase).toBe("logout-pending");
    expect(session.apply(logout, { type: "logout-failure" })).toBe(logout);
    expect(session.getSnapshot()).toMatchObject({
      actorId: 1,
      phase: "authenticated",
      privateLifetime: firstLifetime,
    });
    expect(session.apply(logout, { type: "logout-success" })).toBeNull();
  });

  it("retires a pending logout when the actor changes A → B → A in one turn", () => {
    const client = new QueryClient();
    client.setQueryData(meKey, { userId: 1, accounts: [] });
    const session = getSessionContext(client);
    const first = session.getSnapshot();
    const listener = vi.fn();
    const unsubscribe = session.subscribe(listener);
    const logout = session.beginCommand("logout");

    const second = session.apply(logout, { type: "me-valid", actorId: 2 });
    if (second === null) throw new Error("Actor B must retire the old session");
    expect(
      session.apply(second, { type: "me-valid", actorId: 1 }),
    ).not.toBeNull();

    expect(session.getSnapshot()).toMatchObject({
      actorId: 1,
      phase: "authenticated",
      privateLifetime: first.privateLifetime + 2,
    });
    expect(session.isCurrent(logout)).toBe(false);
    expect(session.apply(logout, { type: "logout-success" })).toBeNull();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("admits no cached actor after retirement until a fresh accepted read or login", () => {
    const client = new QueryClient();
    client.setQueryData(meKey, { userId: 1, accounts: [] });
    const session = getSessionContext(client);
    const unsubscribe = session.subscribe(() => {});
    const retired = session.apply(session.getSnapshot().token, {
      type: "me-unauthorized",
    });
    if (retired === null)
      throw new Error("Current 401 must retire the session");
    const retiredState = session.getSnapshot();

    expect(retiredState).toMatchObject({ actorId: null, phase: "anonymous" });
    client.setQueryData(meKey, { userId: 1, accounts: [] });
    expect(session.apply(retired, { type: "me-unauthorized" })).toBe(retired);
    expect(session.getSnapshot()).toBe(retiredState);

    const login = session.beginCommand("login");
    expect(session.apply(login, { type: "me-valid", actorId: 1 })).toBeNull();
    expect(session.apply(login, { type: "login-success" })).toBe(login);
    expect(session.apply(login, { type: "login-abandoned" })).toBeNull();
    expect(session.apply(login, { type: "me-valid", actorId: 1 })).toBe(login);
    expect(session.getSnapshot()).toMatchObject({
      actorId: 1,
      phase: "authenticated",
    });
    unsubscribe();
  });

  it("keeps independent query clients in independent sessions", () => {
    const first = getSessionContext(new QueryClient());
    const second = getSessionContext(new QueryClient());
    const token = first.beginCommand("login");

    expect(second.getSnapshot().phase).toBe("unresolved");
    expect(second.isCurrent(token)).toBe(false);
    expect(second.apply(token, { type: "login-success" })).toBeNull();
  });
});
