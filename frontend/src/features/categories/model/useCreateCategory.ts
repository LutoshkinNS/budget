import { z } from "zod";

import { useInvalidateCategories } from "@/entities/categories";
import { useCategoriesCreate } from "@/kernel/api/generate/categories/categories.gen.ts";
import { categoriesCreateBody } from "@/kernel/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/shared/lib";

export type CategoryCreateData = z.infer<typeof categoriesCreateBody>;

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
