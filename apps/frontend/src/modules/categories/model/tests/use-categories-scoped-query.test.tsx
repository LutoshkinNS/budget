import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { categoryKeys } from "../category-keys.ts";
import { useCategories } from "../use-categories.ts";

vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

const categoryPayload = [
  {
    id: 3,
    accountId: 42,
    type: "expense",
    name: "Продукты",
    iconKey: "groceries",
  },
];

function seedMe(currentAccountId: number) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [
      { id: currentAccountId, name: "Счёт", initialBalance: 0, isOwner: true },
    ],
    userId: 1,
  });
}

function stubFetch(authMe: () => Response | Promise<Response>) {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      if (url.includes("/api/v1/auth/me")) return authMe();
      if (url.includes("/api/v1/accounts/42/categories")) {
        return Response.json(categoryPayload);
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    calls: () => fetchMock.mock.calls.map(([input]) => String(input)),
  };
}

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient.clear();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("useCategories me-guard and scoped key", () => {
  it("does not run the query while me is loading", async () => {
    let release = () => {};
    const { calls } = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = () => resolve(Response.json({ accounts: [], userId: 1 }));
        }),
    );
    const { result } = renderHook(() => useCategories({ type: "expense" }), {
      wrapper,
    });
    try {
      await waitFor(() => expect(calls()).toHaveLength(1));
      expect(calls().filter((url) => url.includes("/categories"))).toHaveLength(
        0,
      );
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    } finally {
      await act(async () => release());
    }
  });

  it("fetches exactly once under the scoped list key after me is known", async () => {
    seedMe(42);
    const { calls } = stubFetch(() =>
      Response.json({
        accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
        userId: 1,
      }),
    );

    const { result, rerender } = renderHook(
      () => useCategories({ type: "expense" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(
      queryClient.getQueryData(categoryKeys.list(42, { type: "expense" })),
    ).toEqual(categoryPayload);
    expect(
      queryClient.getQueryState(categoryKeys.list(43, { type: "expense" })),
    ).toBeUndefined();
    expect(
      queryClient.getQueryState(["categoriesList", { type: "expense" }]),
    ).toBeUndefined();

    rerender();
    expect(calls()).toHaveLength(1);
  });

  it("reports the initial active request until its first response", async () => {
    seedMe(42);
    let release = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            release = () => resolve(Response.json(categoryPayload));
          }),
      ),
    );
    const { result } = renderHook(() => useCategories({ type: "expense" }), {
      wrapper,
    });
    try {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.data).toEqual([]);
      await act(async () => release());
      await waitFor(() => expect(result.current.data).toEqual(categoryPayload));
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    } finally {
      release();
    }
  });

  it("retains ready data and exposes refetch while its background GET is held", async () => {
    seedMe(42);
    const key = categoryKeys.list(42, { type: "expense" });
    queryClient.setQueryData(key, categoryPayload);
    let release = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = () =>
            resolve(
              Response.json([{ ...categoryPayload[0], name: "Обновлено" }]),
            );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useCategories({ type: "expense" }), {
      wrapper,
    });
    let done: Promise<unknown> = Promise.resolve();
    try {
      act(() => {
        done = result.current.refetch();
      });
      await waitFor(() => expect(result.current.isFetching).toBe(true));
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(categoryPayload);
      await act(async () => {
        release();
        await done;
      });
      await waitFor(() =>
        expect(result.current.data[0]?.name).toBe("Обновлено"),
      );
      expect(result.current.isFetching).toBe(false);
    } finally {
      await act(async () => {
        release();
        await done;
      });
    }
  });

  it("preserves query error state while normalizing missing data", async () => {
    seedMe(42);
    const failure = {
      code: "CATEGORY_DENIED",
      message: "Denied",
      statusCode: 403,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json(failure, { status: 403 }))),
    );
    const { result } = renderHook(() => useCategories({ type: "expense" }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(failure);
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.refetch).toBeTypeOf("function");
  });
});
