import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryIconPicker } from "./category-icon-picker";

afterEach(cleanup);

describe("CategoryIconPicker", () => {
  it("starts without an icon and only changes selection on a user action", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CategoryIconPicker value={null} onChange={onChange} />,
    );
    expect(
      screen
        .getByRole("button", { name: "Без иконки" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Продукты" }));
    expect(onChange).toHaveBeenCalledWith("groceries");
    rerender(<CategoryIconPicker value="groceries" onChange={onChange} />);
    expect(
      screen
        .getByRole("button", { name: "Продукты" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Без иконки" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("has twenty choices and the empty choice, and prevents actions while pending", () => {
    const onChange = vi.fn();
    render(<CategoryIconPicker value="taxi" onChange={onChange} disabled />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(21);
    expect(
      screen
        .getByRole("button", { name: "Такси" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    for (const button of buttons)
      expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Продукты" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
