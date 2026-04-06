import clsx from "clsx";

import s from "./CategoryCard.module.css";

interface CategoryCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: (label: string) => void;
}

export function CategoryCard({
  emoji,
  label,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className={clsx(s.card, selected && s.selected)}
      onClick={() => onSelect(label)}
    >
      {emoji ? <span className={s.emoji}>{emoji}</span> : null}
      <span className={s.label}>{label}</span>
    </button>
  );
}
