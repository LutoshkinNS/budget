import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import {
  getCategoriesGetQueryKey,
  getCategoriesListQueryKey,
} from "@/common/api/generate/categories/categories.gen";

import { useInvalidateCategories } from "./useCategories";

beforeEach(() => {
  queryClient.clear();
});
afterEach(() => {
  queryClient.clear();
});

describe("category query invalidation", () => {
  it("invalidates list variants and the changed detail while preserving unrelated queries", async () => {
    const lists = [
      getCategoriesListQueryKey(),
      getCategoriesListQueryKey({ type: "expense" }),
      getCategoriesListQueryKey({ type: "income" }),
      getCategoriesListQueryKey({ type: "expense", sort: "usage" }),
      getCategoriesListQueryKey({ type: "income", sort: "usage" }),
    ];
    for (const key of lists) queryClient.setQueryData(key, []);
    queryClient.setQueryData(getCategoriesGetQueryKey(3), { id: 3 });
    queryClient.setQueryData(getCategoriesGetQueryKey(4), { id: 4 });
    queryClient.setQueryData(["unrelated"], []);
    await useInvalidateCategories()(3);
    for (const key of lists)
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    expect(
      queryClient.getQueryState(getCategoriesGetQueryKey(3))?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(getCategoriesGetQueryKey(4))?.isInvalidated,
    ).toBe(false);
    expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  });
});
