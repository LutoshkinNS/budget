import { z } from "zod";

import { useInvalidateCategories } from "@/entities/categories";
import { deleteCategoryFormDataSchema } from "@/features/categories/model/shemas.ts";
import { useCategoriesDelete } from "@/kernel/api/generate/categories/categories.gen.ts";
import { categoriesDeleteParams } from "@/kernel/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/shared/lib";

export function useDeleteCategory() {
  const invalidateCategories = useInvalidateCategories();

  const { mutate, isError, error, status } = useCategoriesDelete({
    mutation: {
      onSuccess: async () => {
        await invalidateCategories();
      },
    },
  });

  const deleteCategory = (categoryId: string) => {
    const resultParsedFormData = deleteCategoryFormDataSchema.safeParse({
      categoryId,
    });

    if (!resultParsedFormData.success) {
      const fieldErrors = z.prettifyError(resultParsedFormData.error);
      errorHandler(fieldErrors);
      return;
    }

    const resultDtoParsed = categoriesDeleteParams.safeParse({
      categoryId: resultParsedFormData.data?.categoryId,
    });

    if (!resultDtoParsed.success) {
      const fieldErrors = z.prettifyError(resultDtoParsed.error);
      errorHandler(fieldErrors);
      return;
    }

    mutate(resultDtoParsed.data);
  };

  return { deleteCategory, isError, error, status };
}
