import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CreateCategory } from "./CreateCategory";

const mocks = vi.hoisted(() => ({ createCategory: vi.fn() }));
vi.mock("../model/useCreateCategory.ts", () => ({
  useCreateCategory: () => ({
    createCategory: mocks.createCategory,
    isPending: false,
    isError: false,
    errorMessage: undefined,
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  mocks.createCategory.mockReset();
  mocks.createCategory.mockResolvedValue({ id: 1 });
});

describe("CreateCategory icons", () => {
  it("does not choose an icon based on the category name", async () => {
    render(<CreateCategory type="expense" />);
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
    render(<CreateCategory type="expense" />);
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
