import clsx from "clsx";

import { CategoryIcon } from "@/modules/categories";

import type { CategoryGridItem } from "../model/types.ts";

import s from "./category-card.module.css";

interface CategoryCardProps {
  iconKey: CategoryGridItem["iconKey"];
  label: CategoryGridItem["name"];
  selected: boolean;
  onSelect: (label: CategoryGridItem["name"]) => void;
}

export function CategoryCard({
  iconKey,
  label,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className={clsx(s.card, selected && s.selected)}
      aria-pressed={selected}
      onClick={() => onSelect(label)}
    >
      <CategoryIcon iconKey={iconKey} />
      <span className={s.label}>{label}</span>
    </button>
  );
}
