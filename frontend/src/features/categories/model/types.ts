import { createCategoryFormDataSchema } from "./shemas.ts";
import { z } from "zod";

export type CreateCategoryFormData = z.input<
  typeof createCategoryFormDataSchema
>;
