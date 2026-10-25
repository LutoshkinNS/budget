import { describe, expect, it } from "vitest";

import { subcategoryKeys } from "../subcategory-keys";

describe("subcategoryKeys", () => {
  it("scopes the family under ['account', accountId, 'subcategories']", () => {
    expect(subcategoryKeys.all(42)).toEqual(["account", 42, "subcategories"]);
  });

  it("builds the list key by category id inside the account subtree", () => {
    expect(subcategoryKeys.lists(42)).toEqual([
      "account",
      42,
      "subcategories",
      "list",
    ]);
    expect(subcategoryKeys.list(42, 3)).toEqual([
      "account",
      42,
      "subcategories",
      "list",
      3,
    ]);
  });

  it("does not mix accounts", () => {
    expect(subcategoryKeys.list(42, 3)).not.toEqual(
      subcategoryKeys.list(43, 3),
    );
  });
});
