import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { categoryKeys } from "../category-keys.ts";
import { useCategories } from "../use-categories.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
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
    const { calls } = stubFetch(() => new Promise<Response>(() => {}));

    renderHook(() => useCategories({ type: "expense" }), { wrapper });

    await waitFor(() =>
      expect(
        calls().filter((url) => url.includes("/api/v1/accounts/42/categories")),
      ).toHaveLength(0),
    );
    expect(calls()).toHaveLength(1);
  });

  it("fetches exactly once under the scoped list key after me is known", async () => {
    seedMe(42);
    const { calls } = stubFetch(() =>
      Response.json({ accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }], userId: 1 }),
    );

    const { result, rerender } = renderHook(
      () => useCategories({ type: "expense" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(
      queryClient.getQueryData(categoryKeys.list(42, { type: "expense" })),
    ).toEqual(categoryPayload);
    // Ключ соседнего счёта и generated-ключ без счёта не используются
    expect(
      queryClient.getQueryState(categoryKeys.list(43, { type: "expense" })),
    ).toBeUndefined();
    expect(
      queryClient.getQueryState(["categoriesList", { type: "expense" }]),
    ).toBeUndefined();

    rerender();
    // authMe взят из сида кэша: ровно один GET категорий, без повторов
    expect(calls()).toHaveLength(1);
  });
});
