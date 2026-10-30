import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { Notifications } from "@/common/lib/notifications";

const mocks = vi.hoisted(() => {
  const holder: {
    capturedCallback:
      | ((scope: { accountId: number; categoryId: number }) => unknown)
      | null;
    invalidateTransactionsCategorySummary: ReturnType<typeof vi.fn>;
  } = {
    capturedCallback: null,
    invalidateTransactionsCategorySummary: vi.fn(),
  };
  return holder;
});
vi.mock("@/modules/categories", () => ({
  CategoriesList: ({
    onCategoryUpdated,
  }: {
    onCategoryUpdated: (scope: {
      accountId: number;
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
      if (completion instanceof Promise) await completion;
    }
  });
});
