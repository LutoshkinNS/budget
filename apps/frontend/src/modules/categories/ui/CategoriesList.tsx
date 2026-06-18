import type { CategoryType } from "../model/types.ts";

import { CategoriesSelect } from "./CategoriesSelect.tsx";

type CategoriesListProps = {
  type: CategoryType;
};

export function CategoriesList({ type }: CategoriesListProps) {
  return (
    <form>
      <fieldset>
        <legend>Список категорий</legend>
        <CategoriesSelect type={type} />
      </fieldset>
    </form>
  );
}
