import clsx from "clsx";

import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";

import type { CategoryType } from "../../../../model/types.ts";
import { useCategories } from "../../../../model/use-categories.ts";

import styles from "./categories-select.module.css";

const IDS = {
  CATEGORY: "category",
  LABEL: "category-label",
} as const;

const FIELD_VALUES = {
  CATEGORY_ID: "category_id",
} as const;

type CategoriesSelectProps = React.ComponentPropsWithoutRef<"select"> & {
  type?: CategoryType;
};

export function CategoriesSelect({
  type,
  className,
  ...props
}: CategoriesSelectProps) {
  const {
    data: categoriesResponse,
    hasAccount,
    hasValidData,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useCategories(type ? { type } : undefined);

  if (!hasAccount) {
    return (
      <div className={styles.container}>
        <label id={IDS.LABEL}>Категория</label>
        <p role="status" aria-labelledby={IDS.LABEL}>
          Счёт не выбран
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <label id={IDS.LABEL} htmlFor={IDS.CATEGORY}>
        Категория
      </label>
      {isLoading && !hasValidData ? (
        <div
          className={styles.loading}
          role="status"
          aria-label="Загрузка категорий"
        >
          <Skeleton
            {...(styles.skeleton ? { className: styles.skeleton } : {})}
          />
        </div>
      ) : isError && !hasValidData ? (
        <div className={styles.error} role="alert" aria-labelledby={IDS.LABEL}>
          <p>Не удалось загрузить категории</p>
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
      ) : (
        <>
          <select
            name={FIELD_VALUES.CATEGORY_ID}
            id={IDS.CATEGORY}
            {...props}
            disabled={props.disabled || categoriesResponse.length === 0}
            className={clsx(styles.select, className)}
          >
            {props.value === "" && categoriesResponse.length ? (
              <option value="">Выберите категорию</option>
            ) : null}
            {categoriesResponse.length === 0 ? (
              <option value="">Категорий не найдено</option>
            ) : null}
            {categoriesResponse.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {isError && (
            <div className={styles.error} role="alert">
              <p>Не удалось обновить категории</p>
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
        </>
      )}
    </div>
  );
}
