import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  capturedCallback: null as
    | ((scope: { accountId: number | undefined; categoryId: number }) => void)
    | null,
  invalidateTransactionsCategorySummary: vi.fn(),
}));
vi.mock("@/modules/categories", () => ({
  CategoriesList: ({
    onCategoryUpdated,
  }: {
    onCategoryUpdated: (scope: {
      accountId: number | undefined;
      categoryId: number;
    }) => void;
  }) => {
    mocks.capturedCallback = onCategoryUpdated;
    return null;
  },
  CreateCategory: () => null,
  DeleteCategory: () => null,
}));
vi.mock("@/modules/transactions", () => ({
  invalidateTransactionsCategorySummary:
    mocks.invalidateTransactionsCategorySummary,
}));

import { Categories } from "../categories";

beforeEach(() => {
  mocks.capturedCallback = null;
  mocks.invalidateTransactionsCategorySummary.mockReset();
});
afterEach(cleanup);

describe("Categories page composition", () => {
  it("wires the category rename to the transactions analytics invalidation", async () => {
    render(<Categories />);

    expect(mocks.capturedCallback).not.toBeNull();
    await mocks.capturedCallback?.({ accountId: 42, categoryId: 3 });

    expect(mocks.invalidateTransactionsCategorySummary).toHaveBeenCalledWith(
      42,
    );
  });
});
