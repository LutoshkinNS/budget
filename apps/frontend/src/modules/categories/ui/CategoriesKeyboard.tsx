import { CategoryKeyboard } from "@/modules/expenses/modules/category-keyboard";

import { useCategories } from "../useCategories.ts";

interface CategoriesKeyboardProps {
  className?: string | undefined;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function CategoriesKeyboard({ className, value, onChange }: CategoriesKeyboardProps) {
  const { data: categories } = useCategories();

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
