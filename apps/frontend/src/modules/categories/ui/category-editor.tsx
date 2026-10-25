import { useId, useRef, useState } from "react";

import type { CategoryDTO } from "@/common/api/generate/model";
import { SimpleError } from "@/common/ui/simple-error/SimpleError";

import type { CategoryIconKey } from "../model/category-icons";
import {
  type CategoryUpdatedCallback,
  useUpdateCategory,
} from "../model/use-update-category";

import { CategoryIconPicker } from "./category-icon-picker";

import styles from "./categories-list.module.css";

interface CategoryEditorProps {
  category: CategoryDTO;
  onClose: () => void;
  onCategoryUpdated: CategoryUpdatedCallback;
}

export function CategoryEditor({
  category,
  onClose,
  onCategoryUpdated,
}: CategoryEditorProps) {
  const nameId = useId();
  const [name, setName] = useState(category.name);
  const [iconKey, setIconKey] = useState<CategoryIconKey | null>(
    category.iconKey,
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const { mutateAsync, isPending } = useUpdateCategory({ onCategoryUpdated });
  const pending = isPending || isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitting.current) return;
    if (!name.trim()) {
      setErrorMessage("Наименование категории обязательно");
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    setErrorMessage(undefined);
    try {
      await mutateAsync({
        categoryId: category.id,
        data: { name: name.trim(), iconKey },
      });
      onClose();
    } catch (error) {
      setErrorMessage(
        typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          error.statusCode === 409
          ? "Категория с таким названием уже существует"
          : "Не удалось сохранить категорию. Попробуйте ещё раз.",
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={pending} className={styles.fieldset}>
        <legend>Редактирование категории {category.name}</legend>
        <p>
          <label htmlFor={nameId}>Наименование категории</label>
          <input
            id={nameId}
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </p>
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
