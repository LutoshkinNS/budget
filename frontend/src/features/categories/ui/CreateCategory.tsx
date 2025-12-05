import { useState } from "react";
import { z } from "zod";

import { CreateCategoryFormData } from "@/features/categories";
import { SimpleError } from "@/shared/ui/simple-error";

import { createCategoryFormDataSchema } from "../model/shemas.ts";
import { useCreateCategory } from "../model/useCreateCategory.ts";

const IDS = {
  NAME: "name",
} as const;

const FIELD_NAMES = {
  NAME: "name",
} as const;

export function CreateCategory() {
  const { createCategory, isPending, isError, error } = useCreateCategory();

  const [formState, setFormState] = useState<CreateCategoryFormData>({
    name: "",
  });

  const validationResult = createCategoryFormDataSchema.safeParse(formState);
  const errors = validationResult.success
    ? undefined
    : z.flattenError(validationResult.error);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createCategory(formState);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={isPending}>
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
          <span style={{ color: "red" }}>
            {errors?.fieldErrors.name || errors?.formErrors}
          </span>
        </p>
        {isError && (
          <SimpleError>
            Ошибка: {error?.message || "Не удалось создать категорию"}
          </SimpleError>
        )}
        <button type="submit" disabled={isPending}>
          {isPending ? "Создание..." : "Создать"}
        </button>
      </fieldset>
    </form>
  );
}
