import { describe, expect, it } from "vitest";

import { categoryKeys } from "../category-keys";

describe("categoryKeys", () => {
  it("scopes the family under ['account', accountId, 'categories']", () => {
    expect(categoryKeys.all(42)).toEqual(["account", 42, "categories"]);
  });

  it("builds list keys with params last and null for unknown params", () => {
    expect(categoryKeys.lists(42)).toEqual([
      "account",
      42,
      "categories",
      "list",
    ]);
    // Неизвестные params приводятся к фиксированному null — ключ стабилен
    expect(categoryKeys.list(42)).toEqual([
      "account",
      42,
      "categories",
      "list",
      null,
    ]);
    expect(categoryKeys.list(42, { type: "expense" })).toEqual([
      "account",
      42,
      "categories",
      "list",
      { type: "expense" },
    ]);
    expect(categoryKeys.list(42, { type: "income", sort: "usage" })).toEqual([
      "account",
      42,
      "categories",
      "list",
      { type: "income", sort: "usage" },
    ]);
  });

  it("builds the detail key inside the account subtree", () => {
    expect(categoryKeys.details(42)).toEqual([
      "account",
      42,
      "categories",
      "detail",
    ]);
    expect(categoryKeys.detail(42, 3)).toEqual([
      "account",
      42,
      "categories",
      "detail",
      3,
    ]);
  });

  it("does not mix accounts", () => {
    expect(categoryKeys.list(42, { type: "expense" })).not.toEqual(
      categoryKeys.list(43, { type: "expense" }),
    );
    expect(categoryKeys.detail(42, 3)).not.toEqual(categoryKeys.detail(43, 3));
  });
});
