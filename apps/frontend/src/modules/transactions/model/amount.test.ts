import { describe, expect, it } from "vitest";

import { parseTransactionAmountInput } from "./amount.ts";

describe("parseTransactionAmountInput", () => {
  it("parses decimal amounts with comma separator", () => {
    expect(parseTransactionAmountInput("123,45")).toBe(123.45);
    expect(parseTransactionAmountInput("0,5")).toBe(0.5);
  });

  it("parses decimal amounts with dot separator", () => {
    expect(parseTransactionAmountInput("123.45")).toBe(123.45);
  });

  it("returns null for invalid amount input", () => {
    expect(parseTransactionAmountInput("")).toBeNull();
    expect(parseTransactionAmountInput("123,45,67")).toBeNull();
  });
});
