import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { accountKeys } from "@/common/api/query-keys";
import { deferred } from "@/common/api/tests/deferred";

import { getSessionContext } from "../session-context";
import { useMe } from "../use-me";

const key = getAuthMeQueryKey();
const me = {
  userId: 1,
  accounts: [{ id: 42, name: "Основной", initialBalance: 0, isOwner: true }],
};
const fetchMock = vi.fn<typeof fetch>();
let client: QueryClient;

function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function errorResponse(statusCode: number) {
  return Response.json(
    { statusCode, code: "test", message: "Ошибка" },
    {
      status: statusCode,
    },
  );
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("me cache admission", () => {
  it("shows fresh valid cache without another read, including no accounts", () => {
    const accountless = { userId: 3, accounts: [] };
    client.setQueryData(key, accountless);
    const { result } = renderHook(useMe, { wrapper });

    expect(result.current.data).toEqual(accountless);
    expect(result.current.hasValidData).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["invalid response", "network error"] as const)(
    "keeps the usable profile throughout a refresh ending with %s",
    async (failure) => {
      const read = deferred<Response>();
      fetchMock.mockReturnValueOnce(read.promise);
      client.setQueryData(key, me);
      const { result } = renderHook(useMe, { wrapper });
      const lifetime = result.current.privateLifetime;

      try {
        act(() => {
          void result.current.refetch();
        });
        await waitFor(() => expect(result.current.isFetching).toBe(true));
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(me);
        if (failure === "invalid response") {
          read.resolve(Response.json({ ...me, accounts: false }));
        } else {
          read.reject(new TypeError("Network failure"));
        }
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toEqual(me);
        expect(result.current.privateLifetime).toBe(lifetime);
        expect(client.getQueryData(key)).toEqual(me);
      } finally {
        read.resolve(Response.json(me));
      }
    },
  );

  it("withdraws access on final 401 even with cached valid data", async () => {
    fetchMock
      .mockResolvedValueOnce(errorResponse(401))
      .mockResolvedValueOnce(Response.json({ success: true }))
      .mockResolvedValueOnce(errorResponse(401));
    client.setQueryData(key, me);
    const privateKey = accountKeys.root(42);
    client.setQueryData(privateKey, "доступно до отзыва");
    const { result } = renderHook(useMe, { wrapper });
    const lifetime = result.current.privateLifetime;

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/v1/auth/me",
      "/api/v1/auth/refresh",
      "/api/v1/auth/me",
    ]);
    await waitFor(() => expect(result.current.isUnauthorized).toBe(true));
    expect(result.current.hasValidData).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.privateLifetime).toBeGreaterThan(lifetime);
    expect(client.getQueryData(privateKey)).toBeUndefined();
  });

  it.each([200, 401])(
    "ignores a pre-login me response (%s) after new login and a new read",
    async (status) => {
      const oldRead = deferred<Response>();
      const oldResponse =
        status === 401 ? () => errorResponse(401) : () => Response.json(me);
      fetchMock.mockImplementation((url) => {
        if (url === "/api/v1/auth/refresh") {
          return Promise.resolve(errorResponse(401));
        }
        return Promise.resolve(Response.json({ userId: 2, accounts: [] }));
      });
      fetchMock.mockReturnValueOnce(oldRead.promise);
      const { result } = renderHook(useMe, { wrapper });
      try {
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        const signal = fetchMock.mock.calls[0]?.[1]?.signal;
        const session = getSessionContext(client);
        await act(async () => {
          const loginToken = session.beginCommand("login");
          await client.cancelQueries({ queryKey: key, exact: true });
          session.apply(loginToken, { type: "login-success" });
          await result.current.refetch();
        });
        const next = { userId: 2, accounts: [] };
        await waitFor(() => expect(result.current.data).toEqual(next));
        expect(signal?.aborted).toBe(true);

        await act(async () => oldRead.resolve(oldResponse()));

        expect(result.current.isUnauthorized).toBe(false);
        expect(client.getQueryData(key)).toEqual(next);
        expect(session.getSnapshot().actorId).toBe(2);
      } finally {
        oldRead.resolve(oldResponse());
      }
    },
  );
});
