import { describe, expect, it } from "vitest";

import { parseExpenseAmountInput } from "./amount.ts";

describe("parseExpenseAmountInput", () => {
  it("parses decimal amounts with comma separator", () => {
    expect(parseExpenseAmountInput("123,45")).toBe(123.45);
    expect(parseExpenseAmountInput("0,5")).toBe(0.5);
  });

  it("parses decimal amounts with dot separator", () => {
    expect(parseExpenseAmountInput("123.45")).toBe(123.45);
  });

  it("returns null for invalid amount input", () => {
    expect(parseExpenseAmountInput("")).toBeNull();
    expect(parseExpenseAmountInput("123,45,67")).toBeNull();
  });
});
