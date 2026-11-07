import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { deferred } from "@/common/api/tests/deferred";
import { getSessionContext, useMe } from "@/modules/user";

import { useLogin } from "../use-login";
import { useLogout } from "../use-logout";

const fetchMock = vi.fn<typeof fetch>();
const key = getAuthMeQueryKey();
const actorA = { userId: 1, accounts: [] };
const actorB = { userId: 2, accounts: [] };
const success = () => Response.json({ success: true });
let client: QueryClient;

function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000 },
      mutations: { retry: false },
    },
  });
  client.setQueryData(key, actorA);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("auth command authority", () => {
  it.each(["actor round trip", "unauthorized", "same-actor login"] as const)(
    "ignores a held logout completion after %s",
    async (scenario) => {
      const heldLogout = deferred<Response>();
      fetchMock.mockReturnValueOnce(heldLogout.promise);
      const { result } = renderHook(
        () => ({
          login: useLogin(),
          logout: useLogout(),
          me: useMe(),
        }),
        { wrapper },
      );
      try {
        const logout = result.current.logout.logout();
        await waitFor(() =>
          expect(fetchMock).toHaveBeenCalledWith(
            "/api/v1/auth/logout",
            expect.objectContaining({ method: "POST" }),
          ),
        );
        if (scenario === "unauthorized") {
          const unauthorized = () =>
            Response.json(
              { statusCode: 401, code: "unauthorized", message: "No access" },
              { status: 401 },
            );
          fetchMock
            .mockResolvedValueOnce(unauthorized())
            .mockResolvedValueOnce(success())
            .mockResolvedValueOnce(unauthorized());
          await act(async () => {
            await result.current.me.refetch();
          });
          await waitFor(() =>
            expect(result.current.me.isUnauthorized).toBe(true),
          );
        } else {
          if (scenario === "same-actor login") {
            fetchMock.mockResolvedValueOnce(success());
            await act(async () => {
              expect(await result.current.login.devLogin()).toMatchObject({
                status: "accepted",
              });
            });
          } else {
            fetchMock.mockResolvedValueOnce(Response.json(actorB));
            await act(async () => {
              await result.current.me.refetch();
            });
            await waitFor(() => expect(result.current.me.data).toEqual(actorB));
          }
          fetchMock.mockResolvedValueOnce(Response.json(actorA));
          await act(async () => {
            await result.current.me.refetch();
          });
          await waitFor(() => expect(result.current.me.data).toEqual(actorA));
        }
        const session = getSessionContext(client);
        const current = session.getSnapshot();
        client.setQueryData(["current-context"], "keep");

        await act(async () => {
          heldLogout.resolve(success());
          expect(await logout).toMatchObject({ status: "obsolete" });
        });

        expect(client.getQueryData(["current-context"])).toBe("keep");
        expect(session.getSnapshot()).toBe(current);
      } finally {
        heldLogout.resolve(success());
      }
    },
  );

  it("allows a pending logout to finish after a successful same-actor refresh", async () => {
    const heldLogout = deferred<Response>();
    fetchMock.mockReturnValueOnce(heldLogout.promise);
    const { result } = renderHook(
      () => ({
        logout: useLogout(),
        me: useMe(),
      }),
      { wrapper },
    );
    try {
      const logout = result.current.logout.logout();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const current = getSessionContext(client).getSnapshot();
      const refreshed = {
        ...actorA,
        accounts: [
          { id: 3, name: "Новый счёт", isOwner: true, initialBalance: 0 },
        ],
      };
      fetchMock.mockResolvedValueOnce(Response.json(refreshed));
      await act(async () => {
        await result.current.me.refetch();
      });
      await waitFor(() => expect(result.current.me.data).toEqual(refreshed));
      expect(getSessionContext(client).getSnapshot().token).toBe(current.token);
      expect(getSessionContext(client).getSnapshot().phase).toBe(
        "logout-pending",
      );

      await act(async () => {
        heldLogout.resolve(success());
        expect(await logout).toMatchObject({ status: "accepted" });
      });
      expect(client.getQueryData(key)).toBeUndefined();
    } finally {
      heldLogout.resolve(success());
    }
  });

  it("skips an older login HTTP request when superseded during awaited cancellation", async () => {
    const cancellation = deferred<void>();
    const cancelQueries = client.cancelQueries.bind(client);
    vi.spyOn(client, "cancelQueries").mockImplementationOnce(
      async (filters, options) => {
        await cancelQueries(filters, options);
        await cancellation.promise;
      },
    );
    fetchMock.mockResolvedValueOnce(success());
    const first = renderHook(useLogin, { wrapper });
    const second = renderHook(useLogin, { wrapper });
    try {
      const oldLogin = first.result.current.devLogin();
      expect(fetchMock).not.toHaveBeenCalled();
      await act(async () => {
        expect(await second.result.current.devLogin()).toMatchObject({
          status: "accepted",
        });
      });
      client.setQueryData(["after-login"], "keep");

      await act(async () => {
        cancellation.resolve(undefined);
        expect(await oldLogin).toMatchObject({ status: "obsolete" });
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(client.getQueryData(["after-login"])).toBe("keep");
    } finally {
      cancellation.resolve(undefined);
    }
  });
});
