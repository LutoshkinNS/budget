import clsx from "clsx";

import { useCategories } from "@/modules/categories";

import s from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  value: number | null;
  onChange: (id: number | null) => void;
};

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories } = useCategories({ type: "expense" });

  return (
    <div className={s.chips} role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        className={clsx(s.chip, value === null && s.chipActive)}
        onClick={() => onChange(null)}
      >
        все
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={value === c.id}
          className={clsx(s.chip, value === c.id && s.chipActive)}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
