import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { Notifications } from "@/common/lib/notifications";

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
  queryClient.clear();
  queryClient.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
  });
});
afterEach(() => {
  cleanup();
  queryClient.clear();
});

function renderPage() {
  return render(
    <Notifications>
      <QueryClientProvider client={queryClient}>
        <Categories />
      </QueryClientProvider>
    </Notifications>,
  );
}

describe("Categories page composition", () => {
  it("passes the selected category type to the manager", () => {
    renderPage();

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
    renderPage();

    expect(mocks.capturedCallback).not.toBeNull();
    await mocks.capturedCallback?.({ accountId: 42, categoryId: 3 });

    expect(mocks.invalidateTransactionsCategorySummary).toHaveBeenCalledWith(
      42,
    );
  });

  it("starts analytics refresh without holding the category completion callback", async () => {
    let release = () => {};
    mocks.invalidateTransactionsCategorySummary.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    renderPage();
    const completion = mocks.capturedCallback?.({
      accountId: 42,
      categoryId: 3,
    });
    try {
      expect(mocks.invalidateTransactionsCategorySummary).toHaveBeenCalledWith(
        42,
      );
      expect(completion).toBeUndefined();
    } finally {
      release();
    }
  });
});
