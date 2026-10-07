import { CATEGORY_ICONS, type CategoryIconKey } from "../model/category-icons";

import { CategoryIcon } from "./category-icon";

import styles from "./category-icon-picker.module.css";

interface CategoryIconPickerProps {
  value: CategoryIconKey | null;
  onChange: (value: CategoryIconKey | null) => void;
  disabled?: boolean;
}

export function CategoryIconPicker({
  value,
  onChange,
  disabled = false,
}: CategoryIconPickerProps) {
  return (
    <div className={styles.picker} role="group" aria-label="Выбор иконки">
      <button
        type="button"
        className={styles.empty}
        aria-pressed={value === null}
        disabled={disabled}
        onClick={() => onChange(null)}
      >
        Без иконки
      </button>
      {CATEGORY_ICONS.map((icon) => (
        <button
          key={icon.key}
          type="button"
          aria-label={icon.name}
          title={icon.name}
          aria-pressed={value === icon.key}
          disabled={disabled}
          onClick={() => onChange(icon.key)}
        >
          <CategoryIcon iconKey={icon.key} />
        </button>
      ))}
    </div>
  );
}
