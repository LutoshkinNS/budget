import { type PropsWithChildren, StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { deferred } from "@/common/api/tests/deferred";
import { Notifications } from "@/common/lib/notifications";
import { getSessionContext, useMe } from "@/modules/user";

import { InvitationRedemption } from "../..";

const profile = { userId: 1, accounts: [] };
const joined = {
  userId: 1,
  accounts: [{ id: 42, name: "Общий", initialBalance: 0, isOwner: false }],
};
const invitation = {
  id: 1,
  code: "code-a",
  accountId: 42,
  expiresAt: "2030-01-01T00:00:00.000Z",
};
const key = getAuthMeQueryKey();
const fetchMock = vi.fn<typeof fetch>();
const onRedeemed = vi.fn();
const onAuthenticationRequired = vi.fn();
let client: QueryClient;

function view(code = "code-a", strict = false) {
  const content = (
    <QueryClientProvider client={client}>
      <Notifications>
        <InvitationRedemption
          code={code}
          onRedeemed={onRedeemed}
          onAuthenticationRequired={onAuthenticationRequired}
        />
      </Notifications>
    </QueryClientProvider>
  );
  return strict ? <StrictMode>{content}</StrictMode> : content;
}

function countRedeems() {
  return fetchMock.mock.calls.filter(([url]) =>
    String(url).endsWith("/invitations/redeem"),
  ).length;
}

function errorResponse(statusCode = 500) {
  return Response.json(
    { statusCode, code: "TEST", message: "Ошибка сервера" },
    { status: statusCode },
  );
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000 },
      mutations: { retry: false },
    },
  });
  fetchMock.mockReset();
  onRedeemed.mockReset();
  onAuthenticationRequired.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("invitation redemption", () => {
  it("can redeem with usable cached me after a failed background refresh", async () => {
    client.setQueryData(key, profile);
    const post = deferred<Response>();
    let postFinished = false;
    fetchMock.mockImplementation((url) =>
      String(url).endsWith("/invitations/redeem")
        ? post.promise
        : Promise.resolve(
            postFinished ? Response.json(joined) : errorResponse(),
          ),
    );
    const auth = renderHook(useMe, {
      wrapper: ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await act(async () => {
      await auth.result.current.refetch();
    });
    await waitFor(() => expect(auth.result.current.isError).toBe(true));
    expect(auth.result.current.data).toEqual(profile);
    auth.unmount();
    render(view());
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      expect(onAuthenticationRequired).not.toHaveBeenCalled();
      postFinished = true;
      post.resolve(Response.json(invitation));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
    } finally {
      post.resolve(Response.json(invitation));
    }
  });

  it.each(["server", "schema", "network"] as const)(
    "retries an initial %s authentication failure without starting a write",
    async (failure) => {
      const auth = deferred<Response>();
      const post = deferred<Response>();
      fetchMock
        .mockReturnValueOnce(auth.promise)
        .mockResolvedValueOnce(Response.json(profile))
        .mockReturnValueOnce(post.promise);
      render(view());
      try {
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(countRedeems()).toBe(0);
        if (failure === "network") auth.reject(new TypeError("Disconnected"));
        else
          auth.resolve(
            failure === "schema"
              ? Response.json({ userId: 1, accounts: false })
              : errorResponse(),
          );
        await screen.findByRole("alert");
        expect(onAuthenticationRequired).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", { name: /Повторить/ }));
        await waitFor(() => expect(countRedeems()).toBe(1));
      } finally {
        auth.resolve(Response.json(profile));
        post.resolve(errorResponse());
      }
    },
  );

  it("accepts an accountless actor once in StrictMode and waits for fresh membership", async () => {
    client.setQueryData(key, profile);
    const post = deferred<Response>();
    const refresh = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(post.promise)
      .mockReturnValueOnce(refresh.promise);
    render(view("code-a", true));
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      act(() => client.setQueryData(key, { ...profile }));
      expect(countRedeems()).toBe(1);
      post.resolve(Response.json(invitation));
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      expect(onRedeemed).not.toHaveBeenCalled();
      refresh.resolve(Response.json(joined));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
      expect(client.getQueryData(key)).toEqual(joined);
      expect(countRedeems()).toBe(1);
    } finally {
      post.resolve(Response.json(invitation));
      refresh.resolve(Response.json(joined));
    }
  });

  it("keeps a failed POST until explicit Retry and ignores duplicate Retry events", async () => {
    client.setQueryData(key, profile);
    const retry = deferred<Response>();
    fetchMock
      .mockResolvedValueOnce(errorResponse())
      .mockReturnValueOnce(retry.promise)
      .mockResolvedValueOnce(Response.json(joined));
    render(view());
    try {
      await screen.findByRole("alert");
      act(() => client.setQueryData(key, { ...profile }));
      expect(countRedeems()).toBe(1);
      const button = screen.getByRole("button", { name: /Повторить/ });
      act(() => {
        fireEvent.click(button);
        fireEvent.click(button);
      });
      await waitFor(() => expect(countRedeems()).toBe(2));
      retry.resolve(Response.json(invitation));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
      expect(countRedeems()).toBe(2);
    } finally {
      retry.resolve(Response.json(invitation));
    }
  });

  it("retries only profile GET after successful POST and failed refresh", async () => {
    client.setQueryData(key, joined);
    const retry = deferred<Response>();
    fetchMock
      .mockResolvedValueOnce(Response.json(invitation))
      .mockResolvedValueOnce(errorResponse())
      .mockReturnValue(retry.promise);
    render(view());
    await screen.findByRole("alert");
    expect(onRedeemed).not.toHaveBeenCalled();
    expect(client.getQueryData(key)).toEqual(joined);
    try {
      const button = screen.getByRole("button", { name: /Повторить/ });
      act(() => {
        fireEvent.click(button);
        fireEvent.click(button);
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
      retry.resolve(Response.json(joined));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
      expect(countRedeems()).toBe(1);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      retry.resolve(Response.json(joined));
    }
  });

  it("does not accept a successful refresh without the target membership", async () => {
    client.setQueryData(key, profile);
    fetchMock
      .mockResolvedValueOnce(Response.json(invitation))
      .mockResolvedValueOnce(Response.json(profile))
      .mockResolvedValueOnce(Response.json(joined));
    render(view());
    await screen.findByRole("alert");
    expect(onRedeemed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Повторить/ }));
    await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
    expect(countRedeems()).toBe(1);
  });

  it("rejects a response for another invitation code", async () => {
    client.setQueryData(key, profile);
    fetchMock.mockResolvedValueOnce(
      Response.json({ ...invitation, code: "other" }),
    );
    render(view());
    await screen.findByRole("alert");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onRedeemed).not.toHaveBeenCalled();
  });

  it("routes current final 401 to authentication without redeeming", async () => {
    fetchMock
      .mockResolvedValueOnce(errorResponse(401))
      .mockResolvedValueOnce(errorResponse(401));
    render(view());
    await waitFor(() =>
      expect(onAuthenticationRequired).toHaveBeenCalledTimes(1),
    );
    expect(countRedeems()).toBe(0);
    expect(onRedeemed).not.toHaveBeenCalled();
  });

  it("suppresses a pending old code after a code change", async () => {
    client.setQueryData(key, profile);
    const old = deferred<Response>();
    const current = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(current.promise)
      .mockResolvedValueOnce(Response.json(joined));
    const rendered = render(view());
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      rendered.rerender(view("code-b"));
      await waitFor(() => expect(countRedeems()).toBe(2));
      old.resolve(Response.json(invitation));
      await act(async () => {
        await old.promise;
      });
      expect(onRedeemed).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      current.resolve(Response.json({ ...invitation, code: "code-b" }));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
    } finally {
      old.resolve(Response.json(invitation));
      current.resolve(Response.json({ ...invitation, code: "code-b" }));
    }
  });

  it("cannot refresh or navigate after its session retires before POST completion", async () => {
    client.setQueryData(key, profile);
    const post = deferred<Response>();
    fetchMock.mockReturnValueOnce(post.promise);
    render(view());
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      act(() => {
        getSessionContext(client).beginCommand("login");
        client.clear();
      });
      post.resolve(Response.json(invitation));
      await act(async () => {
        await post.promise;
      });
      expect(onRedeemed).not.toHaveBeenCalled();
      expect(client.getQueryData(key)).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      post.resolve(Response.json(invitation));
    }
  });

  it("starts a new workflow when the accepted actor changes for the same code", async () => {
    client.setQueryData(key, profile);
    const old = deferred<Response>();
    const current = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(Response.json({ userId: 2, accounts: [] }))
      .mockReturnValueOnce(current.promise)
      .mockResolvedValueOnce(Response.json({ ...joined, userId: 2 }));
    render(view());
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      await act(async () => {
        await client.invalidateQueries({ queryKey: key, exact: true });
      });
      await waitFor(() => expect(countRedeems()).toBe(2));
      old.resolve(Response.json(invitation));
      await act(async () => {
        await old.promise;
      });
      expect(onRedeemed).not.toHaveBeenCalled();
      current.resolve(Response.json(invitation));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
      expect(client.getQueryData(key)).toEqual({ ...joined, userId: 2 });
    } finally {
      old.resolve(Response.json(invitation));
      current.resolve(Response.json(invitation));
    }
  });

  it("does not revive the first attempt after code A to B to A", async () => {
    client.setQueryData(key, profile);
    const oldA = deferred<Response>();
    const abandonedB = deferred<Response>();
    const currentA = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(oldA.promise)
      .mockReturnValueOnce(abandonedB.promise)
      .mockReturnValueOnce(currentA.promise)
      .mockResolvedValueOnce(Response.json(joined));
    const rendered = render(view());
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      rendered.rerender(view("code-b"));
      await waitFor(() => expect(countRedeems()).toBe(2));
      rendered.rerender(view("code-a"));
      await waitFor(() => expect(countRedeems()).toBe(3));
      oldA.resolve(Response.json(invitation));
      await act(async () => {
        await oldA.promise;
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(onRedeemed).not.toHaveBeenCalled();
      currentA.resolve(Response.json(invitation));
      await waitFor(() => expect(onRedeemed).toHaveBeenCalledTimes(1));
    } finally {
      oldA.resolve(Response.json(invitation));
      abandonedB.resolve(Response.json({ ...invitation, code: "code-b" }));
      currentA.resolve(Response.json(invitation));
    }
  });

  it("does not refresh or complete after a real unmount during POST", async () => {
    client.setQueryData(key, profile);
    const post = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(post.promise)
      .mockResolvedValueOnce(Response.json(joined));
    const rendered = render(view());
    try {
      await waitFor(() => expect(countRedeems()).toBe(1));
      rendered.unmount();
      post.resolve(Response.json(invitation));
      await act(async () => {
        await post.promise;
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(client.getQueryData(key)).toEqual(profile);
      expect(onRedeemed).not.toHaveBeenCalled();
      expect(onAuthenticationRequired).not.toHaveBeenCalled();
    } finally {
      post.resolve(Response.json(invitation));
    }
  });
});
