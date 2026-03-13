import {
  CategoriesList,
  CreateCategory,
  DeleteCategory,
} from "@/modules/categories";

export function Categories() {
  return (
    <div>
      <CategoriesList />
      <CreateCategory />
      <DeleteCategory />
    </div>
  );
}
