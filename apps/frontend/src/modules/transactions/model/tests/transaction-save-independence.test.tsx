import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { useCategories } from "@/modules/categories";

import { useCreateTransaction } from "../use-create-transaction.ts";
import { useTransactions } from "../use-transactions.ts";

vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

const RANGE = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-02T00:00:00.000Z",
};
const CREATE_BODY = {
  type: "expense",
  amount: 10,
  categoryId: 3,
  date: "2026-10-15T09:00:00.000Z",
} as const;
const SAVED_TRANSACTION = {
  id: 7,
  accountId: 42,
  amount: 10,
  categoryId: 3,
  userId: 1,
  type: "expense",
  description: null,
  date: "2026-10-15T09:00:00.000Z",
} as const;
const CATEGORIES = [
  { id: 3, accountId: 42, type: "expense", name: "Еда", iconKey: null },
  { id: 4, accountId: 42, type: "expense", name: "Такси", iconKey: null },
];
const UPDATED_CATEGORIES = [CATEGORIES[1], CATEGORIES[0]];

const me = {
  accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
  userId: 1,
};

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient.clear();
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

it.each(["history", "categories"] as const)(
  "finishes saving while %s refetch is held and applies background updates",
  async (delayedResource) => {
    const pending: Array<() => void> = [];
    const post: { release?: () => void } = {};
    const calls = { history: 0, plain: 0, usage: 0 };
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input), "http://localhost");
        if (init?.method === "POST") {
          return new Promise<Response>((resolve) => {
            post.release = () => resolve(Response.json(SAVED_TRANSACTION));
          });
        }
        const resource = url.pathname.endsWith("/transactions")
          ? "history"
          : url.searchParams.get("sort") === "usage"
            ? "usage"
            : "plain";
        calls[resource] += 1;
        const body =
          resource === "history"
            ? calls.history === 1
              ? []
              : [SAVED_TRANSACTION]
            : calls[resource] === 1
              ? CATEGORIES
              : UPDATED_CATEGORIES;
        const shouldHold =
          calls[resource] > 1 &&
          (delayedResource === "history"
            ? resource === "history"
            : resource !== "history");
        if (shouldHold) {
          return new Promise<Response>((resolve) => {
            pending.push(() => resolve(Response.json(body)));
          });
        }
        return Promise.resolve(Response.json(body));
      }),
    );
    queryClient.setQueryData(getAuthMeQueryKey(), me);
    const queries = renderHook(
      () => ({
        history: useTransactions(RANGE),
        plain: useCategories({ type: "expense" }),
        usage: useCategories({ type: "expense", sort: "usage" }),
      }),
      { wrapper },
    );
    await waitFor(() => {
      expect(queries.result.current.history.isLoading).toBe(false);
      expect(queries.result.current.plain.data).toEqual(CATEGORIES);
      expect(queries.result.current.usage.data).toEqual(CATEGORIES);
    });

    const save = renderHook(useCreateTransaction, { wrapper });
    let settled = false;
    let done: Promise<unknown> = Promise.resolve();
    try {
      act(() => {
        done = save.result.current.createTransaction(CREATE_BODY).then(() => {
          settled = true;
        });
      });
      await waitFor(() => {
        expect(post.release).toBeTypeOf("function");
        expect(save.result.current.isLoading).toBe(true);
      });
      expect(settled).toBe(false);
      expect(calls).toEqual({ history: 1, plain: 1, usage: 1 });
      act(() => post.release?.());

      await waitFor(() => {
        expect(pending).toHaveLength(delayedResource === "history" ? 1 : 2);
        expect(calls).toEqual({ history: 2, plain: 2, usage: 2 });
        expect(settled).toBe(true);
        expect(save.result.current.isLoading).toBe(false);
      });
      expect(queryClient.isFetching()).toBeGreaterThan(0);
      if (delayedResource === "history") {
        expect(queries.result.current.history.transactions).toEqual([]);
      } else {
        expect(queries.result.current.plain.data).toEqual(CATEGORIES);
        expect(queries.result.current.usage.data).toEqual(CATEGORIES);
      }

      act(() => pending.splice(0).forEach((release) => release()));
      await done;
      await waitFor(() => {
        expect(queries.result.current.history.transactions).toEqual([
          SAVED_TRANSACTION,
        ]);
        expect(queries.result.current.plain.data).toEqual(UPDATED_CATEGORIES);
        expect(queries.result.current.usage.data).toEqual(UPDATED_CATEGORIES);
        expect(queryClient.isFetching()).toBe(0);
      });
    } finally {
      act(() => {
        post.release?.();
        pending.splice(0).forEach((release) => release());
      });
      await done;
    }
  },
);
