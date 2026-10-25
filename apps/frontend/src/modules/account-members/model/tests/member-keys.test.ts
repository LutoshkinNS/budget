import { describe, expect, it } from "vitest";

import { memberKeys } from "../member-keys";

describe("memberKeys", () => {
  it("scopes the family under ['account', accountId, 'members']", () => {
    expect(memberKeys.all(42)).toEqual(["account", 42, "members"]);
  });

  it("does not mix accounts", () => {
    expect(memberKeys.all(42)).not.toEqual(memberKeys.all(43));
  });
});
