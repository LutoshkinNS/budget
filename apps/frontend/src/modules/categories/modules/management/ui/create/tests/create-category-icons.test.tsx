import { QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { Notifications } from "@/common/lib/notifications";

import { CreateCategoryForm } from "../create-category.tsx";

const mocks = vi.hoisted(() => ({ createCategory: vi.fn() }));
vi.mock("../../../model/use-create-category.ts", () => ({
  useCreateCategory: () => ({
    createCategory: mocks.createCategory,
    isPending: false,
    isError: false,
    errorMessage: undefined,
  }),
}));
afterEach(() => {
  cleanup();
  queryClient.clear();
});
beforeEach(() => {
  mocks.createCategory.mockReset();
  mocks.createCategory.mockResolvedValue({ id: 1 });
  queryClient.clear();
  queryClient.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
  });
});

function renderCreate() {
  return render(
    <Notifications>
      <QueryClientProvider client={queryClient}>
        <CreateCategoryForm type="expense" />
      </QueryClientProvider>
    </Notifications>,
  );
}

describe("CreateCategory icons", () => {
  it("does not choose an icon based on the category name", async () => {
    renderCreate();
    fireEvent.change(screen.getByLabelText("Наименование категории"), {
      target: { value: "продукты" },
    });
    expect(
      screen
        .getByRole("button", { name: "Без иконки" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() =>
      expect(mocks.createCategory).toHaveBeenCalledWith({
        name: "продукты",
        type: "expense",
        iconKey: null,
      }),
    );
  });

  it("submits the explicit selection and starts the next category without an icon", async () => {
    renderCreate();
    fireEvent.change(screen.getByLabelText("Наименование категории"), {
      target: { value: "Покупки" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Продукты" }));
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() =>
      expect(mocks.createCategory).toHaveBeenCalledWith({
        name: "Покупки",
        type: "expense",
        iconKey: "groceries",
      }),
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Без иконки" })
          .getAttribute("aria-pressed"),
      ).toBe("true"),
    );
  });
});
