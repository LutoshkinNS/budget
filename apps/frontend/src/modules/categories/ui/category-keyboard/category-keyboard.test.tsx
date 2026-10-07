import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryKeyboard } from "./category-keyboard";

afterEach(cleanup);

describe("CategoryKeyboard", () => {
  it("selects by category ID and resets the selection on a second click", () => {
    const onChange = vi.fn();
    const categories = [
      { id: 17, name: "Покупки", iconKey: "groceries" as const },
    ];
    const { rerender } = render(
      <CategoryKeyboard
        categories={categories}
        value={null}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Покупки" }));
    expect(onChange).toHaveBeenLastCalledWith(17);
    rerender(
      <CategoryKeyboard
        categories={categories}
        value={17}
        onChange={onChange}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: "Покупки" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Покупки" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
