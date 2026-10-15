import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import {
  getCategoriesGetQueryKey,
  getCategoriesListQueryKey,
} from "@/common/api/generate/categories/categories.gen";
import { getTransactionsCategorySummaryQueryKey } from "@/common/api/generate/transactions/transactions.gen";

import { useUpdateCategory } from "./use-update-category";

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

it("invalidates category variants and cached analytics after renaming", async () => {
  const keys = [
    getCategoriesListQueryKey({ type: "expense" }),
    getCategoriesListQueryKey({ type: "income" }),
    getCategoriesGetQueryKey(3),
    getTransactionsCategorySummaryQueryKey({
      from: "2026-10-01",
      to: "2026-11-01",
      compareFrom: "2026-09-01",
      compareTo: "2026-10-01",
      type: "expense",
    }),
    getTransactionsCategorySummaryQueryKey({
      from: "2026-10-01",
      to: "2026-11-01",
      compareFrom: "2026-09-01",
      compareTo: "2026-10-01",
      type: "income",
    }),
  ];
  for (const key of keys) queryClient.setQueryData(key, []);
  queryClient.setQueryData(["unrelated"], []);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: 3, name: "Новое имя" }), {
          status: 200,
        }),
      ),
  );
  const { result } = renderHook(useUpdateCategory, {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  await act(async () => {
    await result.current.mutateAsync({
      categoryId: 3,
      data: { name: "Новое имя" },
    });
  });
  for (const key of keys)
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
});
