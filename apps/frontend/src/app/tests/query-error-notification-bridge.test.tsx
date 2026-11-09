import { type PropsWithChildren, StrictMode } from "react";
import {
  CancelledError,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/app-query";
import { deferred } from "@/common/api/tests/deferred";
import { Notifications } from "@/common/lib/notifications";

import { QueryErrorNotificationBridge } from "../query-error-notification-bridge";

const failure = {
  statusCode: 400,
  code: "QUERY_FAILURE",
  message: "Запрос отклонён",
};

function Root({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <Notifications>
        <QueryErrorNotificationBridge />
        {children}
      </Notifications>
    </QueryClientProvider>
  );
}

function Observer({
  queryFn,
  enabled = true,
}: {
  queryFn: () => Promise<string>;
  enabled?: boolean;
}) {
  const query = useQuery({
    queryKey: ["observed"],
    queryFn,
    enabled,
    retryOnMount: false,
  });
  return (
    <div>
      {query.data ?? "empty"}:{query.isError ? "inline error" : "ok"}
    </div>
  );
}

async function fail(key: string, error: unknown = failure) {
  await act(async () => {
    await queryClient
      .fetchQuery({ queryKey: [key], queryFn: () => Promise.reject(error) })
      .catch(() => {});
  });
}

beforeEach(() => queryClient.clear());
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.useRealTimers();
});

describe("query error notifications through the application cache", () => {
  it("does not replay a single observer failure when a late observer subscribes", async () => {
    const queryFn = vi.fn(() => Promise.reject(failure));
    const view = render(
      <Root>
        <Observer queryFn={queryFn} />
      </Root>,
    );
    await waitFor(() =>
      expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1),
    );
    view.rerender(
      <Root>
        <Observer queryFn={queryFn} />
        <Observer queryFn={queryFn} />
      </Root>,
    );
    await waitFor(() =>
      expect(screen.getAllByText("empty:inline error")).toHaveLength(2),
    );
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
  });
  it("delivers the first child failure once in StrictMode for two observers and does not replay cached errors", async () => {
    const queryFn = vi.fn(() => Promise.reject(failure));
    const tree = (visible: boolean) => (
      <StrictMode>
        <Root>
          {visible && (
            <>
              <Observer queryFn={queryFn} />
              <Observer queryFn={queryFn} />
            </>
          )}
        </Root>
      </StrictMode>
    );
    const view = render(tree(true));
    await waitFor(() =>
      expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1),
    );
    expect(queryFn).toHaveBeenCalledTimes(1);
    view.rerender(tree(false));
    view.rerender(tree(true));
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("keeps equal errors from different keys and a later refetch independent", async () => {
    render(<Root />);
    await fail("first");
    await fail("second");
    await fail("first");
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("button", { name: "×" })[0]!);
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(2);
  });

  it("retains cached data and inline error after a background failure and clears inline error on recovery", async () => {
    queryClient.setQueryData(["observed"], "cached data");
    const queryFn = vi.fn<() => Promise<string>>().mockRejectedValue(failure);
    render(
      <Root>
        <Observer queryFn={queryFn} />
      </Root>,
    );
    expect(screen.getByText("cached data:ok")).toBeTruthy();
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ["observed"] });
    });
    await waitFor(() =>
      expect(screen.getByText("cached data:inline error")).toBeTruthy(),
    );
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
    queryFn.mockResolvedValue("new data");
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ["observed"] });
    });
    await waitFor(() => expect(screen.getByText("new data:ok")).toBeTruthy());
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
  });

  it("publishes only the terminal retry failure, while a recovered retry stays silent", async () => {
    render(<Root />);
    const terminal = deferred<string>();
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockImplementationOnce(() => terminal.promise);
    const request = queryClient
      .fetchQuery({ queryKey: ["retry"], queryFn, retryDelay: 0 })
      .catch(() => {});
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(4));
    expect(screen.queryByText("QUERY_FAILURE")).toBeNull();
    await act(async () => {
      terminal.reject({ ...failure, statusCode: 500 });
      await request;
    });
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
    const recovered = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockResolvedValueOnce("recovered");
    await act(async () => {
      await queryClient.fetchQuery({
        queryKey: ["recovered"],
        queryFn: recovered,
        retryDelay: 0,
      });
    });
    expect(recovered).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
  });

  it.each([400, 0, 401])(
    "does not retry ordinary status %s and reports it once",
    async (statusCode) => {
      render(<Root />);
      const queryFn = vi.fn(() => Promise.reject({ ...failure, statusCode }));
      await act(async () => {
        await queryClient
          .fetchQuery({ queryKey: [statusCode], queryFn })
          .catch(() => {});
      });
      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
    },
  );

  it.each([new CancelledError(), new DOMException("Stopped", "AbortError")])(
    "does not notify cancellation: %s",
    async (error) => {
      render(<Root />);
      await fail("cancelled", error);
      expect(screen.queryByRole("button", { name: "×" })).toBeNull();
    },
  );

  it("keeps success, disabled queries, explicit opt-out and mutations outside the generic path", async () => {
    const queryFn = vi.fn(() => Promise.reject(failure));
    render(
      <Root>
        <Observer queryFn={queryFn} enabled={false} />
      </Root>,
    );
    await act(async () => {
      await queryClient.fetchQuery({
        queryKey: ["success"],
        queryFn: async () => "ok",
      });
      await queryClient
        .fetchQuery({
          queryKey: ["special"],
          meta: { queryErrorNotification: false },
          queryFn: () => Promise.reject(failure),
        })
        .catch(() => {});
      await queryClient
        .getMutationCache()
        .build(queryClient, { mutationFn: () => Promise.reject(failure) })
        .execute(undefined)
        .catch(() => {});
    });
    expect(queryFn).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "×" })).toBeNull();
  });

  it.each([
    {
      error: new Error("Native error"),
      title: "Error",
      message: "Native error",
    },
    {
      error: null,
      title: "Error",
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: 17,
      title: "Error",
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: { code: "", message: "" },
      title: "Error",
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: { code: "SERVER", message: "Details" },
      title: "SERVER",
      message: "Details",
    },
  ])(
    "normalizes runtime error $error without losing its message",
    async ({ error, title, message }) => {
      render(<Root />);
      await fail("unknown", error);
      expect(screen.getByText(title)).toBeTruthy();
      expect(screen.getByText(message)).toBeTruthy();
      expect(screen.getAllByRole("button", { name: "×" })).toHaveLength(1);
    },
  );

  it("drops disconnected events and does not replay them on remount", async () => {
    const view = render(<Root />);
    await fail("before");
    view.unmount();
    await fail("disconnected");
    render(<Root />);
    expect(screen.queryByText("QUERY_FAILURE")).toBeNull();
    await fail("after");
    expect(screen.getAllByText("QUERY_FAILURE")).toHaveLength(1);
  });
});
