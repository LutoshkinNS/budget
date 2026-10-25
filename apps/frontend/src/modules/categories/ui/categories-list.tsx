import type { CategoryType } from "../model/types.ts";
import { useCategories } from "../model/use-categories";
import type { CategoryUpdatedCallback } from "../model/use-update-category";

import { CategoryListItem } from "./category-list-item";

import styles from "./categories-list.module.css";

type CategoriesListProps = {
  type: CategoryType;
  onCategoryUpdated: CategoryUpdatedCallback;
};

export function CategoriesList({ type, onCategoryUpdated }: CategoriesListProps) {
  const { data } = useCategories({ type });
  return (
    <fieldset className={styles.fieldset}>
      <legend>Список категорий</legend>
      <ul className={styles.list}>
        {data.map((category) => (
          <CategoryListItem
            key={category.id}
            category={category}
            onCategoryUpdated={onCategoryUpdated}
          />
        ))}
      </ul>
    </fieldset>
  );
}
