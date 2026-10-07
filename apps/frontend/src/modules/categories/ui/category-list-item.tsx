import { useState } from "react";

import type { CategoryDTO } from "@/common/api/generate/model";

import { CategoryIcon } from "./category-icon";
import { CategoryIconEditor } from "./category-icon-editor";

import styles from "./categories-list.module.css";

export function CategoryListItem({ category }: { category: CategoryDTO }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <span className={styles.name}>{category.name}</span>
        <button
          type="button"
          className={styles.edit}
          aria-label={`Изменить иконку категории ${category.name}`}
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
        >
          <CategoryIcon iconKey={category.iconKey} />
          <span>Иконка</span>
        </button>
      </div>
      {isEditing && (
        <CategoryIconEditor
          key={category.id}
          category={category}
          onClose={() => setIsEditing(false)}
        />
      )}
    </li>
  );
}
