import { useCategories } from "../model/use-categories.ts";

import { CategoryKeyboard } from "./category-keyboard/category-keyboard";
import { CategoryKeyboardSkeleton } from "./category-keyboard/category-keyboard-skeleton";

import s from "./categories-keyboard.module.css";

type CategoryType = "income" | "expense";

interface CategoriesKeyboardProps {
  className?: string | undefined;
  type?: CategoryType;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function CategoriesKeyboard({
  className,
  type = "expense",
  value,
  onChange,
}: CategoriesKeyboardProps) {
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
        <CategoryKeyboardSkeleton />
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
        <CategoryKeyboard
          categories={categories}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}
