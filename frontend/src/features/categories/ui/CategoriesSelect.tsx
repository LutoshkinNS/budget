import { useCategories } from "@/entities/categories";

const IDS = {
  CATEGORY: "category",
} as const;

const FIELD_VALUES = {
  CATEGORY_ID: "category_id",
} as const;

type CategoriesSelectProps = React.ComponentPropsWithoutRef<"select">;

export function CategoriesSelect(props: CategoriesSelectProps) {
  const { data: categoriesResponse, isError } = useCategories();

  return (
    <>
      <label htmlFor={IDS.CATEGORY}>Категория</label>
      <select
        name={FIELD_VALUES.CATEGORY_ID}
        id={IDS.CATEGORY}
        value={
          props.value !== undefined && categoriesResponse.length
            ? categoriesResponse[0].id
            : props.value
        }
        {...props}
      >
        {isError ? (
          <option value="">Не удалось получить категории</option>
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
