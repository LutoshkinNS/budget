import { useCategories } from "@/modules/categories";

import s from "./transactions-by-days.module.css";

export function TransactionCategoriesStatus() {
  const categories = useCategories();

  if (
    !categories.hasAccount ||
    !categories.isError ||
    categories.hasValidData
  ) {
    return null;
  }

  return (
    <div className={s.categoryStatus} role="alert">
      <span>Не удалось загрузить категории операций</span>
      <button
        type="button"
        className={s.retryLink}
        disabled={categories.isFetching}
        onClick={() => void categories.refetch()}
      >
        Повторить
      </button>
    </div>
  );
}
