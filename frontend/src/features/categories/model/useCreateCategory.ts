import { z } from "zod";

import { useCategoriesCreate } from "@/kernel/api/generate/categories/categories.gen.ts";
import { categoriesCreateBody } from "@/kernel/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/shared/lib";

export type CategoryCreateData = z.infer<typeof categoriesCreateBody>;

export function useCreateCategory() {
  const mutation = useCategoriesCreate();

  const createCategory = async (data: CategoryCreateData) => {
    const validateResult = categoriesCreateBody.safeParse(data);

    if (!validateResult.success) {
      const fieldErrors = z.prettifyError(validateResult.error);
      errorHandler(fieldErrors);
      return;
    }

    return await mutation.mutateAsync({ data: validateResult.data });
  };

  return {
    createCategory,
    ...mutation,
  };
}
