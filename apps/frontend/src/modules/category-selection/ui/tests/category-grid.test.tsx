import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryGrid } from "../category-grid";

afterEach(cleanup);

describe("CategoryGrid", () => {
  it("selects by category ID and resets the selection on a second click", () => {
    const onChange = vi.fn();
    const categories = [
      { id: 17, name: "Покупки", iconKey: "groceries" as const },
    ];
    const { rerender } = render(
      <CategoryGrid categories={categories} value={null} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Покупки" }));
    expect(onChange).toHaveBeenLastCalledWith(17);
    rerender(
      <CategoryGrid categories={categories} value={17} onChange={onChange} />,
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
