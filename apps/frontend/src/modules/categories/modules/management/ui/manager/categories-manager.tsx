import { useCurrentAccountId } from "@/modules/user";

import type { CategoryType } from "../../model/types.ts";
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
  const accountId = useCurrentAccountId();

  return (
    <>
      <CategoriesList
        key={"list-" + (accountId ?? "no-account") + "-" + type}
        type={type}
        onCategoryUpdated={onCategoryUpdated}
      />
      <CreateCategoryForm
        key={"create-" + (accountId ?? "no-account") + "-" + type}
        type={type}
      />
      <DeleteCategoryForm
        key={"delete-" + (accountId ?? "no-account") + "-" + type}
        type={type}
      />
    </>
  );
}
