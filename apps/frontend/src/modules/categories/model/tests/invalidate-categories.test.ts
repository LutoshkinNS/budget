import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { queryClient } from "@/common/api/appQuery";

import { invalidateCategories } from "../category-cache";
import { categoryKeys } from "../category-keys";

beforeEach(() => {
  queryClient.clear();
});
afterEach(() => {
  queryClient.clear();
});

describe("category query invalidation", () => {
  it("invalidates list variants and the changed detail while preserving unrelated queries", async () => {
    const lists = [
      categoryKeys.list(42),
      categoryKeys.list(42, { type: "expense" }),
      categoryKeys.list(42, { type: "income" }),
      categoryKeys.list(42, { type: "expense", sort: "usage" }),
      categoryKeys.list(42, { type: "income", sort: "usage" }),
    ];
    for (const key of lists) queryClient.setQueryData(key, []);
    queryClient.setQueryData(categoryKeys.detail(42, 3), { id: 3 });
    queryClient.setQueryData(categoryKeys.detail(42, 4), { id: 4 });
    queryClient.setQueryData(categoryKeys.detail(43, 3), { id: 3 });
    queryClient.setQueryData(["unrelated"], []);
    await invalidateCategories(42, 3);
    for (const key of lists)
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    expect(
      queryClient.getQueryState(categoryKeys.detail(42, 3))?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(categoryKeys.detail(42, 4))?.isInvalidated,
    ).toBe(false);
    expect(
      queryClient.getQueryState(categoryKeys.detail(43, 3))?.isInvalidated,
    ).toBe(false);
    expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  });
});
