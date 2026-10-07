import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryIconEditor } from "./category-icon-editor";

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false }));
vi.mock("../model/use-update-category-icon", () => ({
  useUpdateCategoryIcon: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: mocks.isPending,
  }),
}));
const category = {
  id: 3,
  accountId: 1,
  type: "expense",
  name: "Покупки",
  iconKey: "groceries",
} as const;
afterEach(cleanup);
beforeEach(() => {
  mocks.mutateAsync.mockReset();
  mocks.isPending = false;
});

describe("CategoryIconEditor", () => {
  it("discards draft changes when cancelled", () => {
    const onClose = vi.fn();
    render(<CategoryIconEditor category={category} onClose={onClose} />);
    expect(
      screen
        .getByRole("button", { name: "Продукты" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Такси" }));
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("retains a failed empty selection and permits retry", async () => {
    const onClose = vi.fn();
    mocks.mutateAsync
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValueOnce({ ...category, iconKey: null });
    render(<CategoryIconEditor category={category} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Без иконки" }));
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() =>
      expect(
        screen.getByText(
          "Не удалось сохранить иконку категории. Попробуйте ещё раз.",
        ),
      ).not.toBeNull(),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("button", { name: "Без иконки" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(mocks.mutateAsync).toHaveBeenLastCalledWith({
      categoryId: 3,
      data: { iconKey: null },
    });
  });

  it("blocks saving and cancellation while pending", () => {
    mocks.isPending = true;
    const onClose = vi.fn();
    render(<CategoryIconEditor category={category} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("button", { name: "Сохранить" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
