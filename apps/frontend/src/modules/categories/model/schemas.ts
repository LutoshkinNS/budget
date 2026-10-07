import { z } from "zod";

import { CATEGORY_ICONS } from "./category-icons";

export const createCategoryFormDataSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  name: z.string().min(1, "Наименование категории обязательно"),
  iconKey: z.enum(CATEGORY_ICONS.map((icon) => icon.key)).nullable(),
});

export const deleteCategoryFormDataSchema = z.object({
  categoryId: z.string().pipe(z.coerce.number()),
});
