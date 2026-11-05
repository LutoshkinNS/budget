import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import type { CategoryType } from "../../../../model/types.ts";
import { useCategories } from "../../../../model/use-categories.ts";
import type { CategoryUpdatedCallback } from "../../model/use-update-category.ts";

import { CategoryListItem } from "./category-list-item.tsx";

import styles from "./categories-list.module.css";

const SKELETON_ROWS = 4;

type CategoriesListProps = {
  type: CategoryType;
  onCategoryUpdated: CategoryUpdatedCallback;
};

export function CategoriesList({
  type,
  onCategoryUpdated,
}: CategoriesListProps) {
  const {
    data,
    hasAccount,
    hasValidData,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useCategories({ type });

  return (
    <fieldset className={styles.fieldset}>
      <legend>Список категорий</legend>
      {!hasAccount ? (
        <p role="status">Счёт не выбран</p>
      ) : isLoading && !hasValidData ? (
        <div role="status" aria-label="Загрузка категорий">
          <ul className={styles.list} aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <li className={styles.skeletonRow} key={index}>
                <Skeleton
                  {...(styles.skeletonName
                    ? { className: styles.skeletonName }
                    : {})}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {isError && (
            <div className={styles.readError} role="alert">
              <p>
                {hasValidData
                  ? "Не удалось обновить список категорий"
                  : "Не удалось загрузить список категорий"}
              </p>
              <button
                type="button"
                disabled={isFetching}
                onClick={() => {
                  void refetch();
                }}
              >
                {isFetching ? "Повторная загрузка…" : "Повторить"}
              </button>
            </div>
          )}
          {hasValidData && data.length === 0 && <p>Категорий пока нет</p>}
          {data.length > 0 && (
            <ul className={styles.list}>
              {data.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  onCategoryUpdated={onCategoryUpdated}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </fieldset>
  );
}
