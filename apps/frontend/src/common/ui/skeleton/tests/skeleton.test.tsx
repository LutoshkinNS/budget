import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Skeleton } from "../skeleton.tsx";

afterEach(cleanup);

describe("Skeleton", () => {
  it("renders hidden decoration without a separate loading announcement", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(
      container.querySelectorAll(
        "a[href], button, input, select, textarea, [tabindex]",
      ),
    ).toHaveLength(0);
  });

  it("keeps one consumer status and leaves adjacent actions available", () => {
    const onClick = vi.fn();

    render(
      <>
        <div role="status" aria-label="Загрузка операций">
          <Skeleton />
          <Skeleton />
        </div>
        <button type="button" onClick={onClick}>
          Добавить операцию
        </button>
      </>,
    );

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(
      screen
        .getByRole("status", { name: "Загрузка операций" })
        .querySelectorAll(
          "a[href], button, input, select, textarea, [tabindex]",
        ),
    ).toHaveLength(0);

    const button = screen.getByRole("button", { name: "Добавить операцию" });
    button.focus();
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
