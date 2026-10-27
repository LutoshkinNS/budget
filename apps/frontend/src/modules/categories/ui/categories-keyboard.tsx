import { Loader } from "@/common/ui/loader/Loader.tsx";

import { useCategories } from "../model/use-categories.ts";

import { CategoryKeyboard } from "./category-keyboard/category-keyboard";

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
  const { data: categories, isLoading } = useCategories({
    type,
    sort: "usage",
  });

  return (
    <div className={className}>
      {isLoading ? (
        <div
          className={s.loading}
          role="status"
          aria-label="Загрузка категорий"
        >
          <Loader />
        </div>
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
