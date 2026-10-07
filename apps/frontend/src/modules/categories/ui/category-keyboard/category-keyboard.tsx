import { useCallback } from "react";

import type {
  Category,
  CategoryKeyboardProps,
} from "../../model/category-keyboard";

import { CategoryCard } from "./category-card";

import s from "./category-keyboard.module.css";

export function CategoryKeyboard({
  categories,
  value,
  onChange,
}: CategoryKeyboardProps) {
  const handleSelect = useCallback(
    (id: Category["id"]) => onChange?.(value === id ? null : id),
    [value, onChange],
  );

  const row1 = categories.filter((_, i) => i % 2 === 0);
  const row2 = categories.filter((_, i) => i % 2 !== 0);

  const renderCard = (cat: Category) => (
    <CategoryCard
      key={cat.id}
      iconKey={cat.iconKey}
      label={cat.name}
      selected={value === cat.id}
      onSelect={() => handleSelect(cat.id)}
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
