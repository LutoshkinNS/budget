import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CategoryIcon } from "./category-icon";

afterEach(cleanup);

describe("CategoryIcon", () => {
  it("does not render an image without an explicit selection", () => {
    for (const iconKey of [null, undefined, "", "unknown"]) {
      const { container, unmount } = render(<CategoryIcon iconKey={iconKey} />);
      expect(container.querySelector("img")).toBeNull();
      unmount();
    }
  });

  it("renders different local images as decorative 24px icons", () => {
    const { container, rerender } = render(<CategoryIcon iconKey="groceries" />);
    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.getAttribute("width")).toBe("24");
    expect(image?.getAttribute("height")).toBe("24");
    const source = image?.getAttribute("src");
    expect(source).toMatch(/groceries\.png/);
    expect(source).not.toMatch(/^https?:/);
    rerender(<CategoryIcon iconKey="taxi" />);
    expect(container.querySelector("img")?.getAttribute("src")).toMatch(/taxi\.png/);
    expect(container.querySelector("img")?.getAttribute("src")).not.toBe(source);
  });
});

