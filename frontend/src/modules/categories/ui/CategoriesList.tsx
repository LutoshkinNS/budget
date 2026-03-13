import { CategoriesSelect } from "./CategoriesSelect.tsx";

export function CategoriesList() {
  return (
    <form>
      <fieldset>
        <legend>Список категорий</legend>
        <CategoriesSelect />
      </fieldset>
    </form>
  );
}
