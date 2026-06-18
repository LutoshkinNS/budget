import { useEffect, useState } from "react";

import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";

import type { CategoryType, DeleteCategoryFormData } from "../model/types.ts";
import { useDeleteCategory } from "../model/useDeleteCategory.ts";

import { CategoriesSelect } from "./CategoriesSelect.tsx";

type DeleteCategoryProps = {
  type: CategoryType;
};

export function DeleteCategory({ type }: DeleteCategoryProps) {
  const { deleteCategory } = useDeleteCategory();

  const [formState, setFormState] = useState<DeleteCategoryFormData>({
    categoryId: "",
  });

  useEffect(() => {
    setFormState({ categoryId: "" });
  }, [type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    deleteCategory(formState.categoryId);
  };

  return (
    <FormBlock legend={"Удаление категории"} onSubmit={handleSubmit}>
      <CategoriesSelect
        type={type}
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
