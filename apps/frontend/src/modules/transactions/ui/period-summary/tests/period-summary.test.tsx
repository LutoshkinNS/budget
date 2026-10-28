import type { ComponentProps, PropsWithChildren } from "react";
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

import { transactionKeys } from "../../../model/transaction-keys.ts";
import { PeriodSummary } from "../period-summary.tsx";

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
const SUMMARY = {
  initialBalance: 0,
  incomeTotal: 300,
  expenseTotal: 125,
  periodBalance: 175,
  totalBalance: 475,
};
const notificationSink = {
  addNotification: () => {},
  deleteNotification: () => {},
};
const baseProps: ComponentProps<typeof PeriodSummary> = {
  range: RANGE,
  period: "month",
  month: "2026-10",
  onPeriodChange: () => {},
  onMonthChange: () => {},
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
  release(response: () => Response = () => Response.json(SUMMARY)) {
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

function stubHttp(summary: (url: URL) => Response | Promise<Response>) {
  const requests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname.endsWith("/transactions/summary")) {
        requests.push(url.toString());
        return summary(url);
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
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("PeriodSummary loading states", () => {
  it("keeps period controls available while only totals wait", async () => {
    const summary = new ResponseGate();
    stubHttp(() => summary.wait());
    const onPeriodChange = vi.fn();
    const onMonthChange = vi.fn();
    try {
      render(
        <PeriodSummary
          {...baseProps}
          onPeriodChange={onPeriodChange}
          onMonthChange={onMonthChange}
        />,
        { wrapper: Wrapper },
      );
      await waitFor(() => expect(summary.heldCount).toBe(1));
      const status = screen.getByRole("status");
      expect(status.getAttribute("aria-label")).toBeTruthy();
      expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
      expect(screen.getByText("Доходы периода")).not.toBeNull();
      fireEvent.click(screen.getByRole("tab", { name: "день" }));
      expect(onPeriodChange).toHaveBeenCalledWith("day");
      fireEvent.change(screen.getByLabelText("Месяц"), {
        target: { value: "2026-09" },
      });
      expect(onMonthChange).toHaveBeenCalledWith("2026-09");
      await act(async () => summary.release());
      await screen.findByText("475 ₽");
      expect(screen.queryByRole("status")).toBeNull();
    } finally {
      summary.release();
    }
  });

  it("shows valid zero totals as zero after loading completes", async () => {
    stubHttp(() =>
      Response.json({
        initialBalance: 0,
        incomeTotal: 0,
        expenseTotal: 0,
        periodBalance: 0,
        totalBalance: 0,
      }),
    );
    render(<PeriodSummary {...baseProps} />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getAllByText("0 ₽")).toHaveLength(4));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it.each(["server", "invalid DTO"] as const)(
    "ends initial loading with a local %s error",
    async (failure) => {
      stubHttp(() =>
        failure === "server"
          ? Response.json(
              { code: "SERVER_ERROR", statusCode: 500 },
              { status: 500 },
            )
          : Response.json({ totalBalance: 100 }),
      );
      render(<PeriodSummary {...baseProps} />, { wrapper: Wrapper });
      await screen.findByRole("alert");
      expect(screen.queryByRole("status")).toBeNull();
      expect(
        screen.getByRole("tab", { name: "день" }).hasAttribute("disabled"),
      ).toBe(false);
    },
  );

  it("shows a fresh summary immediately after remounting", async () => {
    const requests = stubHttp(() => Response.json(SUMMARY));
    const first = render(<PeriodSummary {...baseProps} />, {
      wrapper: Wrapper,
    });
    await screen.findByText("475 ₽");
    first.unmount();
    render(<PeriodSummary {...baseProps} />, { wrapper: Wrapper });
    expect(screen.getByText("475 ₽")).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(requests).toHaveLength(1);
  });

  it("preserves same-key totals when a background refresh fails", async () => {
    const refresh = new ResponseGate();
    let requestCount = 0;
    stubHttp(() =>
      ++requestCount === 1 ? Response.json(SUMMARY) : refresh.wait(),
    );
    try {
      render(<PeriodSummary {...baseProps} />, { wrapper: Wrapper });
      await screen.findByText("475 ₽");
      let refreshFinished: Promise<void> | undefined;
      act(() => {
        refreshFinished = client.invalidateQueries({
          queryKey: transactionKeys.summary(42, RANGE),
        });
      });
      await waitFor(() => expect(refresh.heldCount).toBe(1));
      expect(screen.getByText("475 ₽")).not.toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
      await act(async () => {
        refresh.release(() =>
          Response.json({ statusCode: 500 }, { status: 500 }),
        );
        await refreshFinished;
      });
      await screen.findByRole("alert");
      expect(screen.getByText("475 ₽")).not.toBeNull();
      expect(screen.getByText("+175 ₽")).not.toBeNull();
    } finally {
      refresh.release();
    }
  });

  it("does not present previous-range totals as the newly selected range", async () => {
    const next = new ResponseGate();
    stubHttp((url) =>
      url.searchParams.get("from") === RANGE.from
        ? Response.json(SUMMARY)
        : next.wait(),
    );
    try {
      const view = render(<PeriodSummary {...baseProps} />, {
        wrapper: Wrapper,
      });
      await screen.findByText("475 ₽");
      view.rerender(
        <PeriodSummary {...baseProps} range={NEXT_RANGE} month="2026-09" />,
      );
      await waitFor(() => expect(next.heldCount).toBe(1));
      expect(screen.queryByText("475 ₽")).toBeNull();
      expect(screen.getByRole("status")).not.toBeNull();
      expect(screen.getByLabelText("Месяц").getAttribute("value")).toBe(
        "2026-09",
      );
      await act(async () =>
        next.release(() => Response.json({ ...SUMMARY, totalBalance: 999 })),
      );
      await screen.findByText("999 ₽");
      expect(screen.queryByText("475 ₽")).toBeNull();
    } finally {
      next.release();
    }
  });

  it("shows a non-loading account state when no account is available", () => {
    client.setQueryData(getAuthMeQueryKey(), { userId: 1, accounts: [] });
    const requests = stubHttp(() => Response.json(SUMMARY));
    render(<PeriodSummary {...baseProps} />, { wrapper: Wrapper });
    expect(requests).toHaveLength(0);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText(/сч[её]т/i)).not.toBeNull();
  });
});
