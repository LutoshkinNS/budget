import clsx from "clsx";

import type { Category } from "../../model/category-keyboard";
import { CategoryIcon } from "../category-icon";

import s from "./category-card.module.css";

interface CategoryCardProps {
  iconKey: Category["iconKey"];
  label: Category["name"];
  selected: boolean;
  onSelect: (label: Category["name"]) => void;
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
