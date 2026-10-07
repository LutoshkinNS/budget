import type { CategoryType } from "../model/types.ts";
import { useCategories } from "../model/useCategories";

import { CategoryListItem } from "./category-list-item";

import styles from "./categories-list.module.css";

type CategoriesListProps = {
  type: CategoryType;
};

export function CategoriesList({ type }: CategoriesListProps) {
  const { data } = useCategories({ type });
  return (
    <fieldset className={styles.fieldset}>
      <legend>Список категорий</legend>
      <ul className={styles.list}>
        {data.map((category) => (
          <CategoryListItem key={category.id} category={category} />
        ))}
      </ul>
    </fieldset>
  );
}
