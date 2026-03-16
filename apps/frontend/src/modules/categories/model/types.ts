import { z } from "zod";

import {
  createCategoryFormDataSchema,
  deleteCategoryFormDataSchema,
} from "./schemas.ts";

export type CreateCategoryFormData = z.input<
  typeof createCategoryFormDataSchema
>;

export type DeleteCategoryFormData = z.input<
  typeof deleteCategoryFormDataSchema
>;
