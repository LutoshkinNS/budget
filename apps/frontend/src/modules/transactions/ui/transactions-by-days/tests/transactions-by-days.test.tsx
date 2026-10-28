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
import type { TransactionDTO, UserInfoDTO } from "@/common/api/generate/model";
import { NotificationsContext } from "@/common/lib/notifications/useNotifications.ts";

import { transactionKeys } from "../../../model/transaction-keys.ts";
import { TransactionsByDays } from "../transactions-by-days.tsx";

const RANGE = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-02T00:00:00.000Z",
};
const NEXT_RANGE = {
  from: "2026-09-01T00:00:00.000Z",
  to: "2026-09-02T00:00:00.000Z",
};
const ME: UserInfoDTO = {
  userId: 1,
  accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
};
const TRANSACTION: TransactionDTO = {
  id: 101,
  accountId: 42,
  amount: 125,
  categoryId: 3,
  userId: 1,
  type: "expense",
  date: "2026-10-01T09:00:00.000Z",
  description: "Покупка продуктов",
};
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

  release(response: () => Response = () => Response.json([])) {
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

function stubHttp(
  list: (url: URL) => Response | Promise<Response>,
  categories: () => Response | Promise<Response> = () => Response.json([]),
) {
  const listRequests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname.endsWith("/transactions")) {
        listRequests.push(url.toString());
        return list(url);
      }
      if (url.pathname.endsWith("/categories")) return categories();
      throw new Error(`Unexpected request: ${url.pathname}`);
    }),
  );
  return listRequests;
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  client.setQueryData(getAuthMeQueryKey(), ME);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("TransactionsByDays loading states", () => {
  it("keeps loading inside history and shows a decorative skeleton", async () => {
    const history = new ResponseGate();
    stubHttp(() => history.wait());
    const onClick = vi.fn();
    try {
      render(
        <>
          <button onClick={onClick}>Ввести сумму</button>
          <TransactionsByDays range={RANGE} onEdit={() => {}} />
        </>,
        { wrapper: Wrapper },
      );
      await waitFor(() => expect(history.heldCount).toBe(1));
      const status = screen.getByRole("status", { name: "Загрузка операций" });
      expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Ввести сумму" }));
      expect(onClick).toHaveBeenCalledTimes(1);
      await act(async () => history.release());
      await screen.findByText("Нет операций за период");
      expect(
        screen.queryByRole("status", { name: "Загрузка операций" }),
      ).toBeNull();
    } finally {
      history.release();
    }
  });

  it("shows an operation before its category lookup completes", async () => {
    const categories = new ResponseGate();
    stubHttp(
      () => Response.json([TRANSACTION]),
      () => categories.wait(),
    );
    const onEdit = vi.fn();
    try {
      render(<TransactionsByDays range={RANGE} onEdit={onEdit} />, {
        wrapper: Wrapper,
      });
      await waitFor(() => expect(categories.heldCount).toBe(1));
      const operation = screen.getByRole("button", {
        name: /Покупка продуктов.*125 ₽/,
      });
      expect(
        screen.queryByRole("status", { name: "Загрузка операций" }),
      ).toBeNull();
      fireEvent.click(operation);
      expect(onEdit).toHaveBeenCalledWith(101);
    } finally {
      await act(async () => categories.release());
    }
  });

  it.each(["network", "server", "invalid DTO"] as const)(
    "distinguishes %s failure from a successful empty list",
    async (failure) => {
      stubHttp(() => {
        if (failure === "network")
          return Promise.reject(new TypeError("offline"));
        if (failure === "server")
          return Response.json(
            { code: "SERVER_ERROR", message: "Unavailable", statusCode: 500 },
            { status: 500 },
          );
        return Response.json({ items: [] });
      });
      render(<TransactionsByDays range={RANGE} onEdit={() => {}} />, {
        wrapper: Wrapper,
      });
      await screen.findByRole("alert");
      expect(screen.queryByText("Нет операций за период")).toBeNull();
      expect(
        screen.queryByRole("status", { name: "Загрузка операций" }),
      ).toBeNull();
    },
  );

  it("reuses a fresh cached list without a skeleton or another GET", async () => {
    const requests = stubHttp(() => Response.json([TRANSACTION]));
    const first = render(
      <TransactionsByDays range={RANGE} onEdit={() => {}} />,
      { wrapper: Wrapper },
    );
    await screen.findByText("Покупка продуктов");
    first.unmount();
    render(<TransactionsByDays range={RANGE} onEdit={() => {}} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText("Покупка продуктов")).not.toBeNull();
    expect(
      screen.queryByRole("status", { name: "Загрузка операций" }),
    ).toBeNull();
    expect(requests).toHaveLength(1);
  });

  it("keeps cached operations through a held same-key refresh and its error", async () => {
    const refresh = new ResponseGate();
    let requestCount = 0;
    stubHttp(() =>
      ++requestCount === 1 ? Response.json([TRANSACTION]) : refresh.wait(),
    );
    try {
      render(<TransactionsByDays range={RANGE} onEdit={() => {}} />, {
        wrapper: Wrapper,
      });
      await screen.findByText("Покупка продуктов");
      let refreshFinished: Promise<void> | undefined;
      act(() => {
        refreshFinished = client.invalidateQueries({
          queryKey: transactionKeys.list(42, RANGE),
        });
      });
      await waitFor(() => expect(refresh.heldCount).toBe(1));
      expect(screen.getByText("Покупка продуктов")).not.toBeNull();
      expect(
        screen.queryByRole("status", { name: "Загрузка операций" }),
      ).toBeNull();
      await act(async () => {
        refresh.release(() =>
          Response.json(
            { code: "SERVER_ERROR", statusCode: 500 },
            { status: 500 },
          ),
        );
        await refreshFinished;
      });
      await screen.findByRole("alert");
      expect(screen.getByText("Покупка продуктов")).not.toBeNull();
      expect(screen.queryByText("Нет операций за период")).toBeNull();
    } finally {
      refresh.release();
    }
  });

  it("does not show the previous range while a new range is pending or after its late response", async () => {
    const next = new ResponseGate();
    stubHttp((url) =>
      url.searchParams.get("from") === RANGE.from
        ? Response.json([TRANSACTION])
        : next.wait(),
    );
    try {
      const view = render(
        <TransactionsByDays range={RANGE} onEdit={() => {}} />,
        { wrapper: Wrapper },
      );
      await screen.findByText("Покупка продуктов");
      view.rerender(
        <TransactionsByDays range={NEXT_RANGE} onEdit={() => {}} />,
      );
      await waitFor(() => expect(next.heldCount).toBe(1));
      expect(screen.queryByText("Покупка продуктов")).toBeNull();
      expect(
        screen.getByRole("status", { name: "Загрузка операций" }),
      ).not.toBeNull();
      view.rerender(<TransactionsByDays range={RANGE} onEdit={() => {}} />);
      expect(screen.getByText("Покупка продуктов")).not.toBeNull();
      await act(async () =>
        next.release(() =>
          Response.json([
            { ...TRANSACTION, id: 202, description: "Другой период" },
          ]),
        ),
      );
      expect(screen.queryByText("Другой период")).toBeNull();
      expect(screen.getByText("Покупка продуктов")).not.toBeNull();
    } finally {
      next.release();
    }
  });

  it("preserves a successful empty history through a background refresh error", async () => {
    const refresh = new ResponseGate();
    let requestCount = 0;
    stubHttp(() => (++requestCount === 1 ? Response.json([]) : refresh.wait()));
    try {
      render(<TransactionsByDays range={RANGE} onEdit={() => {}} />, {
        wrapper: Wrapper,
      });
      await screen.findByText("Нет операций за период");
      let refreshFinished: Promise<void> | undefined;
      act(() => {
        refreshFinished = client.invalidateQueries({
          queryKey: transactionKeys.list(42, RANGE),
        });
      });
      await waitFor(() => expect(refresh.heldCount).toBe(1));
      expect(screen.getByText("Нет операций за период")).not.toBeNull();
      expect(
        screen.queryByRole("status", { name: "Загрузка операций" }),
      ).toBeNull();
      await act(async () => {
        refresh.release(() =>
          Response.json({ statusCode: 500 }, { status: 500 }),
        );
        await refreshFinished;
      });
      await screen.findByRole("alert");
      expect(screen.getByText("Нет операций за период")).not.toBeNull();
      expect(screen.getByRole("alert").textContent).toMatch(/обнов/i);
    } finally {
      refresh.release();
    }
  });

  it("does not fetch a placeholder account or keep a loading skeleton without an account", () => {
    client.setQueryData(getAuthMeQueryKey(), { userId: 1, accounts: [] });
    const requests = stubHttp(() => Response.json([]));
    render(<TransactionsByDays range={RANGE} onEdit={() => {}} />, {
      wrapper: Wrapper,
    });
    expect(requests).toHaveLength(0);
    expect(
      screen.queryByRole("status", { name: "Загрузка операций" }),
    ).toBeNull();
    expect(screen.queryByText("Нет операций за период")).toBeNull();
    expect(screen.getByText(/сч[её]т/i)).not.toBeNull();
  });
});
