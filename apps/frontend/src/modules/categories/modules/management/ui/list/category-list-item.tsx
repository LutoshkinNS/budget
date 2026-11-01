import { useState } from "react";

import type { CategoryDTO } from "@/common/api/generate/model";

import { CategoryIcon } from "../../../../ui/category-icon.tsx";
import type { CategoryUpdatedCallback } from "../../model/use-update-category.ts";
import { CategoryEditor } from "../edit/category-editor.tsx";

import styles from "./categories-list.module.css";

export function CategoryListItem({
  category,
  onCategoryUpdated,
}: {
  category: CategoryDTO;
  onCategoryUpdated: CategoryUpdatedCallback;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <span className={styles.name}>{category.name}</span>
        <button
          type="button"
          className={styles.edit}
          aria-label={`Изменить категорию ${category.name}`}
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
        >
          <CategoryIcon iconKey={category.iconKey} />
          <span>Изменить</span>
        </button>
      </div>
      {isEditing && (
        <CategoryEditor
          key={category.id}
          category={category}
          onClose={() => setIsEditing(false)}
          onCategoryUpdated={onCategoryUpdated}
        />
      )}
    </li>
  );
}
