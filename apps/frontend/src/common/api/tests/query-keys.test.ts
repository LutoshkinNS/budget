import { describe, expect, it } from "vitest";

import { accountKeys } from "../query-keys";

describe("accountKeys", () => {
  it("builds the account subtree root with the marker first", () => {
    expect(accountKeys.root(42)).toEqual(["account", 42]);
  });

  it("builds the whole-account-scope fallback root", () => {
    expect(accountKeys.all()).toEqual(["account"]);
  });

  it("prefixes different accounts into disjoint subtrees", () => {
    const first = accountKeys.root(42);
    const second = accountKeys.root(43);

    expect(first).not.toEqual(second);
    expect(second.slice(0, first.length)).not.toEqual(first);
  });
});
