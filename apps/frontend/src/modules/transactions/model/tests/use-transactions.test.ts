import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import type {
  TransactionsCategorySummaryParams,
  TransactionsListParams,
  TransactionsSummaryParams,
} from "@/common/api/generate/model";

import {
  invalidateTransaction,
  invalidateTransactionsCategorySummary,
  invalidateTransactionsList,
  invalidateTransactionSummary,
} from "../transaction-cache.ts";
import { transactionKeys } from "../transaction-keys.ts";

const LIST_PARAMS: TransactionsListParams = {
  from: "2026-07-01T00:00:00.000Z",
  to: "2026-07-21T00:00:00.000Z",
};
const SUMMARY_PARAMS: TransactionsSummaryParams = {
  from: "2026-07-01T00:00:00.000Z",
  to: "2026-07-21T00:00:00.000Z",
};
const CATEGORY_SUMMARY_PARAMS: TransactionsCategorySummaryParams = {
  from: "2026-07-01T00:00:00.000Z",
  to: "2026-07-21T00:00:00.000Z",
  compareFrom: "2026-06-01T00:00:00.000Z",
  compareTo: "2026-06-21T00:00:00.000Z",
};

beforeEach(() => {
  queryClient.clear();
});
afterEach(() => {
  queryClient.clear();
  vi.restoreAllMocks();
});

describe("invalidateTransactionsCategorySummary", () => {
  it("invalidates every category summary query when params are omitted", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransactionsCategorySummary(42);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.categorySummaries(42),
    });
  });

  it("invalidates one category summary query when params are provided", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransactionsCategorySummary(
      42,
      CATEGORY_SUMMARY_PARAMS,
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.categorySummary(42, CATEGORY_SUMMARY_PARAMS),
    });
  });
});

describe("invalidateTransactionsList", () => {
  it("invalidates every list variant of the account when params are omitted", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransactionsList(42);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.lists(42),
    });
  });

  it("invalidates one list variant when params are provided", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransactionsList(42, LIST_PARAMS);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.list(42, LIST_PARAMS),
    });
  });
});

describe("invalidateTransaction (detail)", () => {
  it("invalidates the detail of the transaction in the account subtree", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransaction(42, 5);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.detail(42, 5),
    });
  });
});

describe("invalidateTransactionSummary", () => {
  it("invalidates every summary variant of the account when params are omitted", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransactionSummary(42);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.summaries(42),
    });
  });

  it("invalidates one summary variant when params are provided", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await invalidateTransactionSummary(42, SUMMARY_PARAMS);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: transactionKeys.summary(42, SUMMARY_PARAMS),
    });
  });
});
