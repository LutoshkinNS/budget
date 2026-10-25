import { describe, expect, it } from "vitest";

import { transactionKeys } from "../transaction-keys";

describe("transactionKeys", () => {
  it("scopes every family under ['account', accountId, 'transactions']", () => {
    expect(transactionKeys.all(42)).toEqual(["account", 42, "transactions"]);
  });

  it("builds list keys with params last and null for unknown params", () => {
    expect(transactionKeys.lists(42)).toEqual([
      "account",
      42,
      "transactions",
      "list",
    ]);
    // Неизвестные params приводятся к фиксированному null — ключ стабилен
    expect(transactionKeys.list(42)).toEqual([
      "account",
      42,
      "transactions",
      "list",
      null,
    ]);
    expect(
      transactionKeys.list(42, { from: "2026-10-01", to: "2026-10-02" }),
    ).toEqual([
      "account",
      42,
      "transactions",
      "list",
      { from: "2026-10-01", to: "2026-10-02" },
    ]);
  });

  it("builds the detail key inside the account subtree", () => {
    expect(transactionKeys.details(42)).toEqual([
      "account",
      42,
      "transactions",
      "detail",
    ]);
    expect(transactionKeys.detail(42, 5)).toEqual([
      "account",
      42,
      "transactions",
      "detail",
      5,
    ]);
  });

  it("builds summary keys with params last and null for unknown params", () => {
    expect(transactionKeys.summaries(42)).toEqual([
      "account",
      42,
      "transactions",
      "summary",
    ]);
    expect(transactionKeys.summary(42)).toEqual([
      "account",
      42,
      "transactions",
      "summary",
      null,
    ]);
    expect(
      transactionKeys.summary(42, { from: "2026-10-01", to: "2026-10-02" }),
    ).toEqual([
      "account",
      42,
      "transactions",
      "summary",
      { from: "2026-10-01", to: "2026-10-02" },
    ]);
  });

  it("builds category-summary keys with params last and null for unknown params", () => {
    expect(transactionKeys.categorySummaries(42)).toEqual([
      "account",
      42,
      "transactions",
      "category-summary",
    ]);
    expect(transactionKeys.categorySummary(42)).toEqual([
      "account",
      42,
      "transactions",
      "category-summary",
      null,
    ]);
    expect(
      transactionKeys.categorySummary(42, {
        from: "2026-10-01",
        to: "2026-10-02",
        compareFrom: "2026-09-01",
        compareTo: "2026-10-01",
      }),
    ).toEqual([
      "account",
      42,
      "transactions",
      "category-summary",
      {
        from: "2026-10-01",
        to: "2026-10-02",
        compareFrom: "2026-09-01",
        compareTo: "2026-10-01",
      },
    ]);
  });

  it("does not mix families and accounts", () => {
    // Ключи одного семейства другого счёта не совпадают и не являются
    // префиксом: изоляция поддеревьев
    expect(transactionKeys.list(42)).not.toEqual(transactionKeys.list(43));
    expect(transactionKeys.detail(42, 5)).not.toEqual(
      transactionKeys.detail(43, 5),
    );
    expect(transactionKeys.lists(42)).not.toEqual(transactionKeys.details(42));
    expect(transactionKeys.summaries(42)).not.toEqual(
      transactionKeys.categorySummaries(42),
    );
  });
});
