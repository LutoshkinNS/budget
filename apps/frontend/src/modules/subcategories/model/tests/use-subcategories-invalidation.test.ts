import { createElement, type PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createAppQueryClient } from "@/common/api/app-query";

import { subcategoryKeys } from "../subcategory-keys.ts";
import { useInvalidateSubcategories } from "../use-subcategories.ts";

let queryClient: ReturnType<typeof createAppQueryClient>;

beforeEach(() => {
  queryClient = createAppQueryClient(() => {});
  queryClient.clear();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
});

describe("subcategory invalidation scope", () => {
  it("invalidates the list of the category inside the account subtree only", async () => {
    queryClient.setQueryData(subcategoryKeys.list(42, 3), []);
    queryClient.setQueryData(subcategoryKeys.list(42, 4), []);
    queryClient.setQueryData(subcategoryKeys.list(43, 3), []);
    queryClient.setQueryData(["unrelated"], []);

    const { result } = renderHook(useInvalidateSubcategories, {
      wrapper: ({ children }: PropsWithChildren) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    });
    await result.current(42, 3);

    expect(
      queryClient.getQueryState(subcategoryKeys.list(42, 3))?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(subcategoryKeys.list(42, 4))?.isInvalidated,
    ).toBe(false);
    expect(
      queryClient.getQueryState(subcategoryKeys.list(43, 3))?.isInvalidated,
    ).toBe(false);
    expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  });
});
