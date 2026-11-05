import { type CategoryType, useCategories } from "@/modules/categories";

import { CategoryGrid } from "./category-grid.tsx";
import { CategoryPickerSkeleton } from "./category-picker-skeleton.tsx";

import s from "./category-picker.module.css";

interface CategoryPickerProps {
  className?: string | undefined;
  type?: CategoryType;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function CategoryPicker({
  className,
  type = "expense",
  value,
  onChange,
}: CategoryPickerProps) {
  const {
    data: categories,
    refetch,
    isLoading,
    isError,
    hasValidData,
    hasAccount,
  } = useCategories({ type, sort: "usage" });

  if (!hasAccount) {
    return (
      <div className={className}>
        <p className={s.message}>Счёт не выбран</p>
      </div>
    );
  }

  if (isLoading && !hasValidData) {
    return (
      <div className={className}>
        <CategoryPickerSkeleton />
      </div>
    );
  }

  if (isError && !hasValidData) {
    return (
      <div className={className}>
        <div className={s.message} role="alert">
          <p className={s.messageText}>Не удалось загрузить категории</p>
          <button
            type="button"
            className={s.retryButton}
            onClick={() => {
              void refetch();
            }}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {isError && (
        <div className={s.message} role="alert">
          <p className={s.messageText}>Не удалось обновить категории</p>
          <button
            type="button"
            className={s.retryButton}
            onClick={() => {
              void refetch();
            }}
          >
            Повторить
          </button>
        </div>
      )}
      {categories.length === 0 ? (
        <p className={s.message}>
          Категорий {type === "expense" ? "расхода" : "дохода"} пока нет
        </p>
      ) : (
        <CategoryGrid
          categories={categories}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}
