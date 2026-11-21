import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  act,
  cleanup,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ERROR_KIND, ApiError } from "@/common/api/api-error";
import { deferred } from "@/common/api/tests/deferred";
import { useNotifications } from "@/common/lib/notifications";

import { mountQueryTestRoot } from "./mount-query-test-root";
import { QueryTestRoot } from "./query-test-root";

const failure = new ApiError({
  kind: API_ERROR_KIND.http,
  statusCode: 400,
  message: "Запрос отклонён",
});
const title = "Не удалось выполнить запрос";
const clients: ReturnType<typeof mountQueryTestRoot>["client"][] = [];
function mount(...args: Parameters<typeof mountQueryTestRoot>) {
  const root = mountQueryTestRoot(...args);
  clients.push(root.client);
  return root;
}
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.useRealTimers();
});

function Observer({ queryFn }: { queryFn: () => Promise<string> }) {
  const query = useQuery({
    queryKey: ["observed"],
    queryFn,
    retryOnMount: false,
    refetchOnMount: false,
  });
  return (
    <div>
      {query.data ?? "empty"}:{query.isError ? "inline error" : "ok"}
    </div>
  );
}

describe("query provider constructor dependency", () => {
  it("keeps the same client and cache across context changes and rerenders", () => {
    const { result, rerender, unmount } = renderHook(
      () => ({ client: useQueryClient(), model: useNotifications() }),
      { wrapper: QueryTestRoot },
    );
    const first = result.current.client;
    first.setQueryData(["retained"], "cached");
    act(() =>
      result.current.model.addNotification({ title: "Context update" }),
    );
    rerender();
    expect(result.current.client).toBe(first);
    expect(result.current.client.getQueryData(["retained"])).toBe("cached");
    expect(screen.getAllByText("Context update")).toHaveLength(1);
    unmount();
    first.clear();
  });

  it("keeps first-child initial failures silent in StrictMode, then emits one background error for two observers", async () => {
    const queryFn = vi.fn<() => Promise<string>>().mockRejectedValue(failure);
    const root = mount(
      <>
        <Observer queryFn={queryFn} />
        <Observer queryFn={queryFn} />
      </>,
      true,
    );
    await waitFor(() =>
      expect(screen.getAllByText("empty:inline error")).toHaveLength(2),
    );
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(title)).toBeNull();
    act(() => root.client.setQueryData(["observed"], "cached"));
    await act(async () => {
      await root.client.refetchQueries({ queryKey: ["observed"] });
    });
    await waitFor(() =>
      expect(screen.getAllByText("cached:inline error")).toHaveLength(2),
    );
    expect(screen.getAllByText(title)).toHaveLength(1);
    root.rerenderChildren(<Observer queryFn={queryFn} />);
    root.rerenderChildren(
      <>
        <Observer queryFn={queryFn} />
        <Observer queryFn={queryFn} />
      </>,
    );
    expect(screen.getAllByText(title)).toHaveLength(1);
    expect(queryFn).toHaveBeenCalledTimes(2);
    queryFn.mockResolvedValue("recovered");
    await act(async () => {
      await root.client.refetchQueries({ queryKey: ["observed"] });
    });
    await waitFor(() =>
      expect(screen.getAllByText("recovered:ok")).toHaveLength(2),
    );
    expect(screen.getAllByText(title)).toHaveLength(1);
  });

  it("delivers a first-child background error after StrictMode effect setup exactly once", async () => {
    const queryFn = vi.fn(() => Promise.reject(failure));
    function WarmedChild() {
      useQuery({
        queryKey: ["warm-child"],
        queryFn,
        initialData: [],
        staleTime: 0,
      });
      return null;
    }
    mount(<WarmedChild />, true);
    await waitFor(() => expect(screen.getAllByText(title)).toHaveLength(1));
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("keeps disabled queries, successful fetches and mutation rejection outside the generic error path", async () => {
    const queryFn = vi.fn(() => Promise.reject(failure));
    function Disabled() {
      useQuery({ queryKey: ["disabled"], queryFn, enabled: false });
      return null;
    }
    const root = mount(<Disabled />);
    await act(async () => {
      await root.client.fetchQuery({
        queryKey: ["success"],
        queryFn: async () => "ok",
      });
      await root.client
        .getMutationCache()
        .build(root.client, { mutationFn: () => Promise.reject(failure) })
        .execute(undefined)
        .catch(() => {});
    });
    expect(queryFn).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "×" })).toBeNull();
  });

  it("does not mistake observer placeholder data for raw cached success", async () => {
    function PlaceholderObserver() {
      const query = useQuery<string[]>({
        queryKey: ["placeholder"],
        queryFn: () => Promise.reject(failure),
        placeholderData: [],
      });
      return (
        <div>{query.isError ? "placeholder failed" : "placeholder ready"}</div>
      );
    }
    const root = mount(<PlaceholderObserver />);
    await screen.findByText("placeholder failed");
    expect(root.client.getQueryData(["placeholder"])).toBeUndefined();
    expect(screen.queryByText(title)).toBeNull();
  });

  it("keeps equal background errors from different keys and subsequent refetches independent", async () => {
    const root = mount();
    root.client.setQueryData(["first"], []);
    root.client.setQueryData(["second"], []);
    for (const key of ["first", "second", "first"]) {
      await root.client.invalidateQueries({
        queryKey: [key],
        refetchType: "none",
      });
      await act(async () => {
        await root.client
          .fetchQuery({
            queryKey: [key],
            queryFn: () => Promise.reject(failure),
          })
          .catch(() => {});
      });
    }
    expect(screen.getAllByText(title)).toHaveLength(3);
  });

  it.each([
    {
      error: new Error("Native error"),
      title,
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: null,
      title,
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: 17,
      title,
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: { code: "", message: " " },
      title,
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
    {
      error: {
        code: "SERVER",
        message: "Не удалось выполнить запрос. Повторите попытку.",
      },
      title,
      message: "Не удалось выполнить запрос. Повторите попытку.",
    },
  ])(
    "normalizes an unknown cached-query rejection: $error",
    async ({ error, title, message }) => {
      const root = mount();
      root.client.setQueryData(["unknown"], null);
      await root.client.invalidateQueries({
        queryKey: ["unknown"],
        refetchType: "none",
      });
      await act(async () => {
        await root.client
          .fetchQuery({
            queryKey: ["unknown"],
            queryFn: () => Promise.reject(error),
          })
          .catch(() => {});
      });
      expect(screen.getByText(title)).toBeTruthy();
      expect(screen.getByText(message)).toBeTruthy();
      expect(screen.getAllByRole("button", { name: "×" })).toHaveLength(1);
    },
  );

  it("drops a late error from an unmounted provider without timers or delivery to the next root", async () => {
    vi.useFakeTimers();
    const old = mount();
    old.client.setQueryDefaults(["late"], { gcTime: Infinity });
    old.client.setQueryData(["late"], []);
    await old.client.invalidateQueries({
      queryKey: ["late"],
      refetchType: "none",
    });
    const response = deferred<string>();
    const request = old.client
      .fetchQuery({ queryKey: ["late"], queryFn: () => response.promise })
      .catch(() => {});
    old.unmount();
    const next = mount();
    const timerCount = vi.getTimerCount();
    await act(async () => {
      response.reject(failure);
      await request;
    });
    expect(vi.getTimerCount()).toBe(timerCount);
    expect(screen.queryByText(title)).toBeNull();
    expect(next.client.getQueryData(["late"])).toBeUndefined();
  });
});
