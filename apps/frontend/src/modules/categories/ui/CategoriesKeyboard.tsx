import { CategoryKeyboard } from "@/modules/expenses/modules/category-keyboard";

import { useCategories } from "../model/useCategories.ts";

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
  const { data: categories } = useCategories({ type });

  const items = categories.map((cat) => ({ emoji: "", label: cat.name }));
  const selectedName = categories.find((cat) => cat.id === value)?.name ?? null;

  const handleChange = (name: string | null) => {
    const id = categories.find((cat) => cat.name === name)?.id ?? null;
    onChange(id);
  };

  return (
    <div className={className}>
      <CategoryKeyboard
        categories={items}
        value={selectedName}
        onChange={handleChange}
      />
    </div>
  );
}
