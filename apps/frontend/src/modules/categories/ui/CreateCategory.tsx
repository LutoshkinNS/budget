import { useRef, useState } from "react";
import { z } from "zod";

import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";

import { createCategoryFormDataSchema } from "../model/schemas.ts";
import type { CategoryType, CreateCategoryFormData } from "../model/types.ts";
import { useCreateCategory } from "../model/use-create-category.ts";

import { CategoryIconPicker } from "./category-icon-picker";

import s from "./create-category.module.css";

const IDS = {
  NAME: "name",
} as const;

const FIELD_NAMES = {
  NAME: "name",
} as const;

type CreateCategoryProps = {
  type: CategoryType;
};

export function CreateCategory({ type }: CreateCategoryProps) {
  const { createCategory, isPending, isError, errorMessage } =
    useCreateCategory();

  const [formState, setFormState] = useState<CreateCategoryFormData>({
    name: "",
    iconKey: null,
  });
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const pending = isPending || isSubmitting;

  const validationResult = createCategoryFormDataSchema.safeParse(formState);
  const errors = validationResult.success
    ? undefined
    : z.flattenError(validationResult.error);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || submitting.current) return;

    const validationResult = createCategoryFormDataSchema.safeParse(formState);

    if (!validationResult.success) {
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      const category = await createCategory({ ...validationResult.data, type });
      if (category) setFormState({ name: "", iconKey: null });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Не удалось создать категорию",
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={pending} className={s.fieldset}>
        <legend>Создание новой категории</legend>
        <p>
          <label htmlFor={IDS.NAME}>Наименование категории</label>
          <input
            type="text"
            name={FIELD_NAMES.NAME}
            id={IDS.NAME}
            value={formState.name}
            onChange={(e) =>
              setFormState((formState) => ({
                ...formState,
                name: e.target.value,
              }))
            }
          />
          <br />
          <span className={s.fieldError}>
            {errors?.fieldErrors.name || errors?.formErrors}
          </span>
        </p>
        <CategoryIconPicker
          value={formState.iconKey}
          onChange={(iconKey) =>
            setFormState((state) => ({ ...state, iconKey }))
          }
          disabled={pending}
        />
        {(isError || submitError) && (
          <SimpleError>
            Ошибка:{" "}
            {submitError || errorMessage || "Не удалось создать категорию"}
          </SimpleError>
        )}
        <button type="submit" disabled={pending || !validationResult.success}>
          {pending ? "Создание..." : "Создать"}
        </button>
      </fieldset>
    </form>
  );
}
