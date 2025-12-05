import { z } from "zod";

export const createCategoryFormDataSchema = z.object({
  name: z.string().min(1, "Наименование категории обязательно"),
});

export const deleteCategoryFormDataSchema = z.object({
  categoryId: z.string().pipe(z.coerce.number()),
});
