import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryCard } from "./category-card";

afterEach(cleanup);

describe("category selection with icons", () => {
  it("shows the saved icon and keeps category selection working", () => {
    const onSelect = vi.fn();
    render(
      <CategoryCard
        iconKey="groceries"
        label="Покупки"
        selected
        onSelect={onSelect}
      />,
    );
    const button = screen.getByRole("button", { name: "Покупки" });
    expect(button.querySelector("img")?.getAttribute("src")).toMatch(
      /groceries.png/,
    );
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith("Покупки");
  });

  it("does not choose an icon from a label and reflects icon removal", () => {
    const onSelect = vi.fn();
    const { container, rerender } = render(
      <CategoryCard
        iconKey={null}
        label="продукты"
        selected={false}
        onSelect={onSelect}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    rerender(
      <CategoryCard
        iconKey="taxi"
        label="продукты"
        selected={false}
        onSelect={onSelect}
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toMatch(
      /taxi.png/,
    );
    rerender(
      <CategoryCard
        iconKey={null}
        label="продукты"
        selected={false}
        onSelect={onSelect}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
  });
});
