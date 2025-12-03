import { useCategories } from "@/entities/categories";

const IDS = {
  CATEGORY: "category",
} as const;

const FIELD_VALUES = {
  CATEGORY_ID: "category_id",
} as const;

export function CategoriesList() {
  const { data: categoriesResponse, status } = useCategories();

  if (status === "error") {
    return <>error CategoriesList</>;
  }

  if (status === "pending") {
    return <>loading...</>;
  }

  return (
    <form>
      <fieldset>
        <legend>Список категорий</legend>
        <label htmlFor={IDS.CATEGORY}>Категории</label>
        <select name={FIELD_VALUES.CATEGORY_ID} id={IDS.CATEGORY}>
          {categoriesResponse.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </fieldset>
    </form>
  );
}
