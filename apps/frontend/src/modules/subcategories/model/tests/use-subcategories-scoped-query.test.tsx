import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { subcategoryKeys } from "../subcategory-keys.ts";
import { useSubcategories } from "../use-subcategories.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

const subcategoryPayload = [{ id: 7, categoryId: 3, name: "Овощи" }];

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
      if (url.includes("/subcategories")) {
        return Response.json(subcategoryPayload);
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

describe("useSubcategories me-guard and scoped key", () => {
  it("does not run the query while me is loading", async () => {
    const { calls } = stubFetch(() => new Promise<Response>(() => {}));

    renderHook(() => useSubcategories(3), { wrapper });

    await waitFor(() =>
      expect(
        calls().filter((url) => url.includes("/subcategories")),
      ).toHaveLength(0),
    );
    expect(calls()).toHaveLength(1);
  });

  it("fetches under the scoped list key after me is known", async () => {
    seedMe(42);
    const { calls } = stubFetch(() =>
      Response.json({ accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }], userId: 1 }),
    );

    const { result } = renderHook(() => useSubcategories(3), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(queryClient.getQueryData(subcategoryKeys.list(42, 3))).toEqual(
      subcategoryPayload,
    );
    expect(
      queryClient.getQueryState(subcategoryKeys.list(43, 3)),
    ).toBeUndefined();
    expect(
      calls().filter((url) => url.includes("/subcategories")),
    ).toHaveLength(1);
  });
});
