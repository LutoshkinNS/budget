import type { CategoryType } from "../../../../model/types.ts";
import type { CategoryUpdatedCallback } from "../../model/use-update-category.ts";
import { CreateCategoryForm } from "../create/create-category.tsx";
import { DeleteCategoryForm } from "../delete/delete-category.tsx";
import { CategoriesList } from "../list/categories-list.tsx";

type CategoriesManagerProps = {
  type: CategoryType;
  onCategoryUpdated: CategoryUpdatedCallback;
};

export function CategoriesManager({
  type,
  onCategoryUpdated,
}: CategoriesManagerProps) {
  return (
    <>
      <CategoriesList
        key={`list-${type}`}
        type={type}
        onCategoryUpdated={onCategoryUpdated}
      />
      <CreateCategoryForm key={`create-${type}`} type={type} />
      <DeleteCategoryForm key={`delete-${type}`} type={type} />
    </>
  );
}
