import { z } from "zod";

export const createCategoryFormDataSchema = z.object({
  name: z.string().min(1, "Наименование категории обязательно"),
});
