import { useState } from "react";

import { FormBlock } from "@/shared/ui/form-block";

import { DeleteCategoryFormData } from "../model/types.ts";
import { useDeleteCategory } from "../model/useDeleteCategory.ts";

import { CategoriesSelect } from "./CategoriesSelect.tsx";

export function DeleteCategory() {
  const { deleteCategory } = useDeleteCategory();

  const [formState, setFormState] = useState<DeleteCategoryFormData>({
    categoryId: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    deleteCategory(formState.categoryId);
  };

  return (
    <FormBlock legend={"Удаление категории"} onSubmit={handleSubmit}>
      <CategoriesSelect
        value={formState.categoryId}
        onChange={(e) =>
          setFormState((formState) => ({
            ...formState,
            categoryId: e.target.value,
          }))
        }
      />
      <button type="submit">Удалить</button>
    </FormBlock>
  );
}
