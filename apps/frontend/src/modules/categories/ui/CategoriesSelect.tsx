import type { CategoryType } from "../model/types.ts";
import { useCategories } from "../useCategories.ts";

const IDS = {
  CATEGORY: "category",
} as const;

const FIELD_VALUES = {
  CATEGORY_ID: "category_id",
} as const;

type CategoriesSelectProps = React.ComponentPropsWithoutRef<"select"> & {
  type?: CategoryType;
};

export function CategoriesSelect({ type, ...props }: CategoriesSelectProps) {
  const { data: categoriesResponse } = useCategories(
    type ? { type } : undefined,
  );

  return (
    <>
      <label htmlFor={IDS.CATEGORY}>Категория</label>
      <select
        name={FIELD_VALUES.CATEGORY_ID}
        id={IDS.CATEGORY}
        {...props}
      >
        {props.value === "" && categoriesResponse.length ? (
          <option value="">Выберите категорию</option>
        ) : null}
        {!categoriesResponse || !categoriesResponse.length ? (
          <option value="">Категорий не найдено</option>
        ) : null}
        {categoriesResponse.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </>
  );
}
