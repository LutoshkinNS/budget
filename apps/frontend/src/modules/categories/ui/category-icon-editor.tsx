import { useRef, useState } from "react";

import type { CategoryDTO } from "@/common/api/generate/model";
import { SimpleError } from "@/common/ui/simple-error/SimpleError";

import type { CategoryIconKey } from "../model/category-icons";
import { useUpdateCategoryIcon } from "../model/use-update-category-icon";

import { CategoryIconPicker } from "./category-icon-picker";

import styles from "./categories-list.module.css";

interface CategoryIconEditorProps {
  category: CategoryDTO;
  onClose: () => void;
}

export function CategoryIconEditor({
  category,
  onClose,
}: CategoryIconEditorProps) {
  const [iconKey, setIconKey] = useState<CategoryIconKey | null>(
    category.iconKey,
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const { mutateAsync, isPending } = useUpdateCategoryIcon();
  const pending = isPending || isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setErrorMessage(undefined);
    try {
      await mutateAsync({ categoryId: category.id, data: { iconKey } });
      onClose();
    } catch {
      setErrorMessage(
        "Не удалось сохранить иконку категории. Попробуйте ещё раз.",
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={pending} className={styles.fieldset}>
        <legend>Иконка категории {category.name}</legend>
        <CategoryIconPicker
          value={iconKey}
          onChange={setIconKey}
          disabled={pending}
        />
        {errorMessage && <SimpleError>{errorMessage}</SimpleError>}
        <div className={styles.actions}>
          <button type="submit" disabled={pending}>
            Сохранить
          </button>
          <button type="button" disabled={pending} onClick={onClose}>
            Отмена
          </button>
        </div>
        {pending && <p role="status">Сохранение...</p>}
      </fieldset>
    </form>
  );
}
