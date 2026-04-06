import { useCallback } from "react";

import { Category, CategoryKeyboardProps } from "../models/types";

import { CategoryCard } from "./CategoryCard";

import s from "./CategoryKeyboard.module.css";

export function CategoryKeyboard({
  categories,
  value,
  onChange,
}: CategoryKeyboardProps) {
  const handleSelect = useCallback(
    (label: string) => onChange?.(value === label ? null : label),
    [value, onChange],
  );

  const row1 = categories.filter((_, i) => i % 2 === 0);
  const row2 = categories.filter((_, i) => i % 2 !== 0);

  const renderCard = (cat: Category) => (
    <CategoryCard
      key={cat.label}
      emoji={cat.emoji}
      label={cat.label}
      selected={value === cat.label}
      onSelect={handleSelect}
    />
  );

  return (
    <div className={s.scroll}>
      <div className={s.grid}>
        <div className={s.row}>{row1.map(renderCard)}</div>
        <div className={s.row}>{row2.map(renderCard)}</div>
      </div>
    </div>
  );
}
