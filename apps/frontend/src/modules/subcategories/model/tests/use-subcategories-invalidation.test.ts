import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { queryClient } from "@/common/api/appQuery";

import { subcategoryKeys } from "../subcategory-keys.ts";
import { useInvalidateSubcategories } from "../use-subcategories.ts";

beforeEach(() => {
  queryClient.clear();
});
afterEach(() => {
  queryClient.clear();
});

describe("subcategory invalidation scope", () => {
  it("invalidates the list of the category inside the account subtree only", async () => {
    queryClient.setQueryData(subcategoryKeys.list(42, 3), []);
    queryClient.setQueryData(subcategoryKeys.list(42, 4), []);
    queryClient.setQueryData(subcategoryKeys.list(43, 3), []);
    queryClient.setQueryData(["unrelated"], []);

    await useInvalidateSubcategories()(42, 3);

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
