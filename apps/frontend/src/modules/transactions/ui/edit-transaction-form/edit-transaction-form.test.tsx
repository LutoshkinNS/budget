import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CategoryDTO, TransactionDTO } from "@/common/api/generate/model";

import { EditTransactionForm } from "./edit-transaction-form";

const mocks = vi.hoisted(() => {
  const categories: Pick<CategoryDTO, "id" | "name" | "iconKey">[] = [];
  return { categories, useCategories: vi.fn(), updateTransaction: vi.fn() };
});

vi.mock("@/modules/categories", () => ({
  useCategories: (params: unknown) => {
    mocks.useCategories(params);
    return { data: mocks.categories };
  },
}));
vi.mock("../../model/useUpdateTransaction.ts", () => ({
  useUpdateTransaction: () => ({
    updateTransaction: mocks.updateTransaction,
    isLoading: false,
  }),
}));

const transaction: TransactionDTO = {
  id: 7,
  accountId: 1,
  userId: 2,
  type: "expense",
  amount: 25,
  categoryId: 2,
  date: "2026-10-15T09:00:00.000Z",
  description: null,
};

afterEach(cleanup);
beforeEach(() => {
  mocks.categories = [
    { id: 1, name: "Новая первая", iconKey: null },
    { id: 2, name: "Выбранная", iconKey: null },
  ];
  mocks.useCategories.mockClear();
  mocks.updateTransaction.mockReset().mockResolvedValue(undefined);
});

describe("EditTransactionForm", () => {
  it("keeps the selected category ID when usage refetch changes option order", async () => {
    const { rerender } = render(
      <EditTransactionForm transaction={transaction} />,
    );
    const categorySelect = screen.getByRole("combobox", { name: "Категория" });
    if (!(categorySelect instanceof HTMLSelectElement)) {
      throw new Error("Category control must be a select element");
    }
    expect(categorySelect.value).toBe("2");
    expect(mocks.useCategories).toHaveBeenCalledWith({
      type: "expense",
      sort: "usage",
    });

    mocks.categories = [
      { id: 2, name: "Выбранная", iconKey: null },
      { id: 1, name: "Новая первая", iconKey: null },
    ];
    rerender(<EditTransactionForm transaction={transaction} />);
    expect(categorySelect.value).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() =>
      expect(mocks.updateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 2, type: "expense" }),
      ),
    );
  });
});
