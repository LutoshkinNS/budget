import { useCategories } from "../model/use-categories.ts";

import { CategoryKeyboard } from "./category-keyboard/category-keyboard";

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
  const { data: categories } = useCategories({ type, sort: "usage" });

  return (
    <div className={className}>
      <CategoryKeyboard
        categories={categories}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
