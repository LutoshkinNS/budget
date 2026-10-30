import { useRef, useState } from "react";

import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";
import { useCurrentAccountId } from "@/modules/user";

import type { CategoryType, DeleteCategoryFormData } from "../model/types.ts";
import { useDeleteCategory } from "../model/use-delete-category.ts";

import { CategoriesSelect } from "./categories-select.tsx";

import styles from "./delete-category.module.css";

type DeleteCategoryProps = {
  type: CategoryType;
};

export function DeleteCategory({ type }: DeleteCategoryProps) {
  const accountId = useCurrentAccountId();
  const { deleteCategory, isError, isPending } = useDeleteCategory();

  const [formState, setFormState] = useState<DeleteCategoryFormData>({
    categoryId: "",
  });
  const deleting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = isPending || isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      accountId == null ||
      !formState.categoryId ||
      pending ||
      deleting.current
    ) {
      return;
    }

    deleting.current = true;
    setIsSubmitting(true);
    try {
      await deleteCategory(formState.categoryId);
      setFormState({ categoryId: "" });
    } catch {
      // Ошибка остаётся в состоянии мутации и показывается рядом с действием.
    } finally {
      deleting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <FormBlock
      className={styles.form}
      legend={"Удаление категории"}
      onSubmit={handleSubmit}
    >
      <CategoriesSelect
        type={type}
        value={formState.categoryId}
        disabled={pending}
        onChange={(e) =>
          setFormState((formState) => ({
            ...formState,
            categoryId: e.target.value,
          }))
        }
      />
      {isError && accountId != null && (
        <div role="alert">
          <SimpleError>
            Не удалось удалить категорию. Попробуйте ещё раз.
          </SimpleError>
        </div>
      )}
      <button
        type="submit"
        disabled={accountId == null || pending || !formState.categoryId}
      >
        {pending ? "Удаление…" : "Удалить"}
      </button>
    </FormBlock>
  );
}
