import {
  CategoriesList,
  CreateCategory,
  DeleteCategory,
} from "@/features/categories";

export function Categories() {
  return (
    <div>
      <CategoriesList />
      <CreateCategory />
      <DeleteCategory />
    </div>
  );
}
