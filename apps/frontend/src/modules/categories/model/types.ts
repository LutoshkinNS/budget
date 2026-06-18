import { z } from "zod";

import type { CategoriesListParams } from "@/common/api/generate/model";

import {
  createCategoryFormDataSchema,
  deleteCategoryFormDataSchema,
} from "./schemas.ts";

export type CategoryType = NonNullable<CategoriesListParams["type"]>;

export type CreateCategoryFormData = z.input<
  typeof createCategoryFormDataSchema
>;

export type DeleteCategoryFormData = z.input<
  typeof deleteCategoryFormDataSchema
>;
