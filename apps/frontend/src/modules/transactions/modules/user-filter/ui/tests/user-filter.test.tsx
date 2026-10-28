import type { PropsWithChildren } from "react";
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

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import type { UserInfoDTO } from "@/common/api/generate/model";
import { NotificationsContext } from "@/common/lib/notifications/useNotifications.ts";
import { switchAccount } from "@/modules/user";

import { UserFilter } from "../user-filter.tsx";

const ME: UserInfoDTO = {
  userId: 1,
  accounts: [
    { id: 42, name: "Первый", initialBalance: 0, isOwner: true },
    { id: 43, name: "Второй", initialBalance: 0, isOwner: true },
  ],
};
const MEMBERS = [
  { userId: 1, firstName: "Анна", photoUrl: null },
  { userId: 2, firstName: "Пётр", photoUrl: null },
];
const notificationSink = {
  addNotification: () => {},
  deleteNotification: () => {},
};

class ResponseGate {
  private response: (() => Response) | undefined;
  private pending: Array<(response: Response) => void> = [];
  get heldCount() {
    return this.pending.length;
  }
  wait() {
    if (this.response) return Promise.resolve(this.response());
    return new Promise<Response>((resolve) => this.pending.push(resolve));
  }
  release(response: () => Response = () => Response.json(MEMBERS)) {
    this.response = response;
    this.pending.splice(0).forEach((resolve) => resolve(response()));
  }
}

let client: QueryClient;

function Wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={client}>
      <NotificationsContext.Provider value={notificationSink}>
        {children}
      </NotificationsContext.Provider>
    </QueryClientProvider>
  );
}

function stubHttp(members: (url: URL) => Response | Promise<Response>) {
  const requests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname.endsWith("/auth/me")) return Response.json(ME);
      if (url.pathname.endsWith("/members")) {
        requests.push(url.toString());
        return members(url);
      }
      throw new Error(`Unexpected request: ${url.pathname}`);
    }),
  );
  return requests;
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  client.setQueryData(getAuthMeQueryKey(), ME);
  switchAccount(42);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  client.clear();
  switchAccount(42);
  vi.unstubAllGlobals();
});

describe("UserFilter loading states", () => {
  it("shows a local skeleton until the participant count is known", async () => {
    const members = new ResponseGate();
    stubHttp(() => members.wait());
    try {
      render(<UserFilter value={null} onChange={() => {}} />, {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(members.heldCount).toBe(1));
      const status = screen.getByRole("status");
      expect(status.getAttribute("aria-label")).toBeTruthy();
      expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
      expect(screen.queryByRole("tablist")).toBeNull();
      await act(async () => members.release());
      await screen.findByRole("tab", { name: "Анна" });
      expect(screen.queryByRole("status")).toBeNull();
    } finally {
      members.release();
    }
  });

  it.each([
    { members: [] },
    { members: [{ userId: 1, firstName: "Анна", photoUrl: null }] },
  ])(
    "hides an unnecessary filter only after a successful small response",
    async ({ members }) => {
      const requests = stubHttp(() => Response.json(members));
      render(<UserFilter value={null} onChange={() => {}} />, {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(requests).toHaveLength(1));
      await waitFor(() => expect(client.isFetching()).toBe(0));
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("tablist")).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
    },
  );

  it.each(["server", "invalid DTO"] as const)(
    "shows a local %s error instead of silently hiding the filter",
    async (failure) => {
      stubHttp(() =>
        failure === "server"
          ? Response.json(
              { code: "SERVER_ERROR", statusCode: 500 },
              { status: 500 },
            )
          : Response.json({ members: [] }),
      );
      render(<UserFilter value={null} onChange={() => {}} />, {
        wrapper: Wrapper,
      });
      await screen.findByRole("alert");
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("tablist")).toBeNull();
    },
  );

  it("changes the local filter without another members or transactions request", async () => {
    const requests = stubHttp(() => Response.json(MEMBERS));
    const onChange = vi.fn();
    render(<UserFilter value={null} onChange={onChange} />, {
      wrapper: Wrapper,
    });
    fireEvent.click(await screen.findByRole("tab", { name: "Пётр" }));
    expect(onChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole("tab", { name: "все" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(requests).toHaveLength(1);
  });

  it("reuses fresh participants immediately after remounting", async () => {
    const requests = stubHttp(() => Response.json(MEMBERS));
    const first = render(<UserFilter value={null} onChange={() => {}} />, {
      wrapper: Wrapper,
    });
    await screen.findByRole("tab", { name: "Анна" });
    first.unmount();
    render(<UserFilter value={null} onChange={() => {}} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole("tab", { name: "Анна" })).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(requests).toHaveLength(1);
  });

  it("keeps participant controls visible after a same-key background refresh error", async () => {
    const refresh = new ResponseGate();
    let requestCount = 0;
    stubHttp(() =>
      ++requestCount === 1 ? Response.json(MEMBERS) : refresh.wait(),
    );
    try {
      render(<UserFilter value={null} onChange={() => {}} />, {
        wrapper: Wrapper,
      });
      await screen.findByRole("tab", { name: "Анна" });
      let refreshFinished: Promise<void> | undefined;
      act(() => {
        refreshFinished = client.invalidateQueries();
      });
      await waitFor(() => expect(refresh.heldCount).toBe(1));
      expect(screen.getByRole("tab", { name: "Анна" })).not.toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
      await act(async () => {
        refresh.release(() =>
          Response.json({ statusCode: 500 }, { status: 500 }),
        );
        await refreshFinished;
      });
      await screen.findByRole("alert");
      expect(
        screen.getByRole("tab", { name: "Анна" }).hasAttribute("disabled"),
      ).toBe(false);
    } finally {
      refresh.release();
    }
  });

  it("does not carry previous-account participants into a new pending account", async () => {
    const secondAccount = new ResponseGate();
    stubHttp((url) =>
      url.pathname.includes("/42/")
        ? Response.json(MEMBERS)
        : secondAccount.wait(),
    );
    try {
      render(<UserFilter value={null} onChange={() => {}} />, {
        wrapper: Wrapper,
      });
      await screen.findByRole("tab", { name: "Анна" });
      act(() => switchAccount(43));
      await waitFor(() => expect(secondAccount.heldCount).toBe(1));
      expect(screen.queryByRole("tab", { name: "Анна" })).toBeNull();
      expect(screen.getByRole("status")).not.toBeNull();
      await act(async () =>
        secondAccount.release(() =>
          Response.json([
            { userId: 3, firstName: "Мария" },
            { userId: 4, firstName: "Иван" },
          ]),
        ),
      );
      await screen.findByRole("tab", { name: "Мария" });
      expect(screen.queryByRole("tab", { name: "Анна" })).toBeNull();
      act(() => switchAccount(42));
      expect(screen.getByRole("tab", { name: "Анна" })).not.toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    } finally {
      secondAccount.release();
    }
  });

  it("does not query a placeholder account or show an endless skeleton without accounts", () => {
    client.setQueryData(getAuthMeQueryKey(), { userId: 1, accounts: [] });
    const requests = stubHttp(() => Response.json(MEMBERS));
    render(<UserFilter value={null} onChange={() => {}} />, {
      wrapper: Wrapper,
    });
    expect(requests).toHaveLength(0);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("reports an update failure for a successful empty participant list", async () => {
    const refresh = new ResponseGate();
    let requestCount = 0;
    const requests = stubHttp(() =>
      ++requestCount === 1 ? Response.json([]) : refresh.wait(),
    );
    try {
      render(<UserFilter value={null} onChange={() => {}} />, {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(requests).toHaveLength(1));
      await waitFor(() => expect(client.isFetching()).toBe(0));
      expect(screen.queryByRole("tablist")).toBeNull();
      let refreshFinished: Promise<void> | undefined;
      act(() => {
        refreshFinished = client.invalidateQueries();
      });
      await waitFor(() => expect(refresh.heldCount).toBe(1));
      expect(screen.queryByRole("status")).toBeNull();
      await act(async () => {
        refresh.release(() =>
          Response.json({ statusCode: 500 }, { status: 500 }),
        );
        await refreshFinished;
      });
      const error = await screen.findByRole("alert");
      expect(error.textContent).toMatch(/обнов/i);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("tablist")).toBeNull();
    } finally {
      refresh.release();
    }
  });
});
