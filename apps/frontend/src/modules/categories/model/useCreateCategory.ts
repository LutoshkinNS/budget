import { z } from "zod";

import { useCategoriesCreate } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesCreateBody } from "@/common/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/common/lib/error-handler/error-handler.ts";

import { useInvalidateCategories } from "../useCategories.ts";

export type CategoryCreateData = z.infer<typeof CategoriesCreateBody>;

export function useCreateCategory() {
  const invalidateCategory = useInvalidateCategories();

  const mutation = useCategoriesCreate({
    mutation: {
      onSuccess: async () => {
        await invalidateCategory();
      },
    },
  });

  const createCategory = async (data: CategoryCreateData) => {
    const validateResult = CategoriesCreateBody.safeParse(data);

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
