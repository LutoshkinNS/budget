import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryEditor } from "../category-editor";

const mocks = vi.hoisted(() => {
  const holder: {
    mutateAsync: ReturnType<typeof vi.fn>;
    isPending: boolean;
    receivedOptions: { onCategoryUpdated?: unknown } | undefined;
  } = {
    mutateAsync: vi.fn(),
    isPending: false,
    receivedOptions: undefined,
  };
  return holder;
});
vi.mock("../../model/use-update-category", () => ({
  useUpdateCategory: (options?: { onCategoryUpdated?: unknown }) => {
    mocks.receivedOptions = options;
    return {
      mutateAsync: mocks.mutateAsync,
      isPending: mocks.isPending,
    };
  },
}));
const onCategoryUpdated = vi.fn().mockResolvedValue(undefined);
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
  onCategoryUpdated.mockClear();
});

describe("CategoryEditor", () => {
  it("trims a renamed category and preserves its ID and selected icon", async () => {
    const onClose = vi.fn();
    mocks.mutateAsync.mockResolvedValue({ ...category, name: "Новое имя" });
    render(
      <CategoryEditor
        category={category}
        onClose={onClose}
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
    fireEvent.change(screen.getByLabelText("Наименование категории"), {
      target: { value: "  Новое имя  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      categoryId: category.id,
      data: { name: "Новое имя", iconKey: category.iconKey },
    });
    expect(mocks.receivedOptions?.onCategoryUpdated).toBe(onCategoryUpdated);
  });

  it("rejects whitespace locally and retains the draft after a duplicate response", async () => {
    const onClose = vi.fn();
    render(
      <CategoryEditor
        category={category}
        onClose={onClose}
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
    const name = screen.getByLabelText("Наименование категории");
    fireEvent.change(name, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(
      screen.getByText("Наименование категории обязательно"),
    ).not.toBeNull();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    mocks.mutateAsync.mockRejectedValue({
      statusCode: 409,
      code: "CATEGORY_ALREADY_EXISTS",
    });
    fireEvent.change(name, { target: { value: "Занято" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() =>
      expect(
        screen.getByText("Категория с таким названием уже существует"),
      ).not.toBeNull(),
    );
    expect(name.getAttribute("value")).toBe("Занято");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("discards draft changes when cancelled", () => {
    const onClose = vi.fn();
    render(
      <CategoryEditor
        category={category}
        onClose={onClose}
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: "Продукты" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Такси" }));
    fireEvent.change(screen.getByLabelText("Наименование категории"), {
      target: { value: "Черновик" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("retains a failed empty selection and permits retry", async () => {
    const onClose = vi.fn();
    mocks.mutateAsync
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValueOnce({ ...category, iconKey: null });
    render(
      <CategoryEditor
        category={category}
        onClose={onClose}
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Без иконки" }));
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() =>
      expect(
        screen.getByText("Не удалось сохранить категорию. Попробуйте ещё раз."),
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
      data: { name: category.name, iconKey: null },
    });
  });

  it("blocks saving and cancellation while pending", () => {
    mocks.isPending = true;
    const onClose = vi.fn();
    render(
      <CategoryEditor
        category={category}
        onClose={onClose}
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
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
