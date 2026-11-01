import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const holder: {
    capturedCallback:
      | ((scope: { accountId: number; categoryId: number }) => void)
      | null;
    capturedType: "expense" | "income" | undefined;
    invalidateTransactionsCategorySummary: ReturnType<typeof vi.fn>;
  } = {
    capturedCallback: null,
    capturedType: undefined,
    invalidateTransactionsCategorySummary: vi.fn(),
  };
  return holder;
});
vi.mock("@/modules/categories", () => ({
  CategoriesManager: ({
    type,
    onCategoryUpdated,
  }: {
    type: "expense" | "income";
    onCategoryUpdated: (scope: {
      accountId: number;
      categoryId: number;
    }) => void;
  }) => {
    mocks.capturedCallback = onCategoryUpdated;
    mocks.capturedType = type;
    return null;
  },
}));
vi.mock("@/modules/transactions", () => ({
  invalidateTransactionsCategorySummary:
    mocks.invalidateTransactionsCategorySummary,
}));

import { Categories } from "../categories";

beforeEach(() => {
  mocks.capturedCallback = null;
  mocks.capturedType = undefined;
  mocks.invalidateTransactionsCategorySummary.mockReset();
});
afterEach(cleanup);

describe("Categories page composition", () => {
  it("passes the selected category type to the manager", () => {
    render(<Categories />);

    expect(mocks.capturedType).toBe("expense");
    fireEvent.click(screen.getByRole("button", { name: "доходы" }));
    expect(mocks.capturedType).toBe("income");
    expect(
      screen
        .getByRole("button", { name: "доходы" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "расходы" }));
    expect(mocks.capturedType).toBe("expense");
  });

  it("wires the category rename to the transactions analytics invalidation", async () => {
    render(<Categories />);

    expect(mocks.capturedCallback).not.toBeNull();
    await mocks.capturedCallback?.({ accountId: 42, categoryId: 3 });

    expect(mocks.invalidateTransactionsCategorySummary).toHaveBeenCalledWith(
      42,
    );
  });
});
