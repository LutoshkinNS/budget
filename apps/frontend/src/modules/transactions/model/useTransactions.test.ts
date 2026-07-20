import { afterEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import type { TransactionsCategorySummaryParams } from "@/common/api/generate/model";
import { getTransactionsCategorySummaryQueryKey } from "@/common/api/generate/transactions/transactions.gen.ts";

import { useInvalidateTransactionsCategorySummary } from "./useTransactions.ts";

describe("useInvalidateTransactionsCategorySummary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invalidates every category summary query when params are omitted", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    await useInvalidateTransactionsCategorySummary()();

    const options = invalidateQueries.mock.calls[0]?.[0] as unknown as {
      predicate: (query: { queryKey: unknown[] }) => boolean;
    };

    expect(
      options.predicate({ queryKey: ["transactionsCategorySummary"] }),
    ).toBe(true);
    expect(options.predicate({ queryKey: ["transactionsSummary"] })).toBe(
      false,
    );
  });

  it("invalidates one category summary query when params are provided", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();
    const params: TransactionsCategorySummaryParams = {
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-21T00:00:00.000Z",
      compareFrom: "2026-06-01T00:00:00.000Z",
      compareTo: "2026-06-21T00:00:00.000Z",
    };

    await useInvalidateTransactionsCategorySummary()(params);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: getTransactionsCategorySummaryQueryKey(params),
    });
  });
});
