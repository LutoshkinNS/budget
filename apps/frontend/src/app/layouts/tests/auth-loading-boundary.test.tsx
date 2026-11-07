import { memo, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { deferred } from "@/common/api/tests/deferred";
import { getSessionContext } from "@/modules/user";

import { PrivateLayout } from "../private";

const { navigate, mountPrivate } = vi.hoisted(() => ({
  navigate: vi.fn(),
  mountPrivate: vi.fn(),
}));

function PrivateScreen() {
  const [draft, setDraft] = useState("");
  useEffect(() => {
    mountPrivate();
  }, []);
  return (
    <input
      aria-label="Черновик"
      value={draft}
      onChange={(event) => {
        setDraft(event.currentTarget.value);
      }}
    />
  );
}

vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  Outlet: memo(PrivateScreen),
  useNavigate: () => navigate,
}));

vi.mock(import("@/modules/navigation"), () => ({
  Navigation: () => (
    <nav>
      <button type="button">Разделы</button>
    </nav>
  ),
}));

const key = getAuthMeQueryKey();
const me = { userId: 1, accounts: [] };
const fetchMock = vi.fn<typeof fetch>();
let client: QueryClient;

function renderPrivate() {
  return render(
    <QueryClientProvider client={client}>
      <PrivateLayout />
    </QueryClientProvider>,
  );
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
  vi.useRealTimers();
});

describe("private auth boundary", () => {
  it.each([
    "server error",
    "network error",
    "invalid response",
    "invalid cache",
  ] as const)(
    "keeps navigation usable and blocks private mount before retry after %s",
    async (failure) => {
      const read = deferred<Response>();
      if (failure === "invalid cache") {
        client.setQueryData(key, { userId: 1, accounts: false });
        fetchMock.mockResolvedValueOnce(Response.json(me));
      } else {
        fetchMock
          .mockReturnValueOnce(read.promise)
          .mockResolvedValueOnce(Response.json(me));
      }
      renderPrivate();

      try {
        expect(screen.getByRole("button", { name: "Разделы" })).toBeInstanceOf(
          HTMLButtonElement,
        );
        expect(mountPrivate).not.toHaveBeenCalled();
        if (failure !== "invalid cache") {
          expect(screen.getByRole("status")).not.toBeNull();
          expect(
            screen.queryByRole("textbox", { name: "Черновик" }),
          ).toBeNull();
          if (failure === "server error") read.resolve(errorResponse(500));
          if (failure === "network error")
            read.reject(new TypeError("Disconnected"));
          if (failure === "invalid response")
            read.resolve(Response.json({ accounts: [] }));
        }
        const retry = await screen.findByRole("button", { name: /повторить/i });
        expect(screen.queryByRole("textbox", { name: "Черновик" })).toBeNull();
        expect(mountPrivate).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();

        fireEvent.click(retry);

        expect(
          await screen.findByRole("textbox", { name: "Черновик" }),
        ).not.toBeNull();
        expect(mountPrivate).toHaveBeenCalledTimes(1);
      } finally {
        read.resolve(Response.json(me));
      }
    },
  );

  it("closes a cached private screen on a final 401 and redirects to login", async () => {
    client.setQueryData(key, me);
    fetchMock
      .mockResolvedValueOnce(errorResponse(401))
      .mockResolvedValueOnce(Response.json({ success: true }))
      .mockResolvedValueOnce(errorResponse(401));
    renderPrivate();
    expect(screen.getByRole("textbox", { name: "Черновик" })).not.toBeNull();

    await act(async () => {
      await client.invalidateQueries({ queryKey: key });
    });

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: "/login", replace: true }),
    );
    expect(screen.queryByRole("textbox", { name: "Черновик" })).toBeNull();
  });

  it("retires an expired initial attempt and ignores a transport response after navigation", async () => {
    vi.useFakeTimers();
    const read = deferred<Response>();
    fetchMock.mockReturnValueOnce(read.promise);
    renderPrivate();
    try {
      expect(fetchMock).toHaveBeenCalledOnce();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(12_000);
      });

      expect(navigate).toHaveBeenCalledWith({ to: "/login", replace: true });
      expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
      await act(async () => {
        read.resolve(Response.json(me));
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(mountPrivate).not.toHaveBeenCalled();
      expect(client.getQueryData(key)).toBeUndefined();
    } finally {
      read.resolve(Response.json(me));
    }
  });

  it("remounts the private draft after a batched A → B → A lifetime change", async () => {
    client.setQueryData(key, me);
    renderPrivate();
    fireEvent.change(screen.getByRole("textbox", { name: "Черновик" }), {
      target: { value: "Предыдущая сессия" },
    });
    const session = getSessionContext(client);
    act(() => {
      const next = session.apply(session.getSnapshot().token, {
        type: "me-valid",
        actorId: 2,
      });
      if (next === null) throw new Error("Expected an accepted new actor");
      session.apply(next, { type: "me-valid", actorId: 1 });
    });

    await waitFor(() => expect(mountPrivate).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("textbox", { name: "Черновик" })).toHaveProperty(
      "value",
      "",
    );
  });
});
