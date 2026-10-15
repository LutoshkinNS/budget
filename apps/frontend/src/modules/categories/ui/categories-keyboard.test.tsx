import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CategoryDTO } from "@/common/api/generate/model";

import { CategoriesKeyboard } from "./CategoriesKeyboard";

const mocks = vi.hoisted(() => {
  const categories: Pick<CategoryDTO, "id" | "name" | "iconKey">[] = [];
  return { categories, useCategories: vi.fn() };
});

vi.mock("../model/useCategories.ts", () => ({
  useCategories: (params: unknown) => {
    mocks.useCategories(params);
    return { data: mocks.categories };
  },
}));

afterEach(cleanup);
beforeEach(() => {
  mocks.categories = [
    { id: 1, name: "Частая", iconKey: null },
    { id: 2, name: "Редкая", iconKey: null },
  ];
  mocks.useCategories.mockClear();
});

describe("CategoriesKeyboard", () => {
  it.each(["expense", "income"] as const)(
    "requests the backend usage order for %s",
    (type) => {
      render(
        <CategoriesKeyboard type={type} value={null} onChange={vi.fn()} />,
      );

      expect(mocks.useCategories).toHaveBeenCalledWith({
        type,
        sort: "usage",
      });
      expect(screen.getByRole("button", { name: "Частая" })).toBeTruthy();
    },
  );
});
