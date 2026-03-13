import { z } from "zod";

import { useCategoriesDelete } from "@/common/api/generate/categories/categories.gen.ts";
import { categoriesDeleteParams } from "@/common/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/common/lib/error-handler/error-handler.ts";

import { useInvalidateCategories } from "../useCategories.ts";

import { deleteCategoryFormDataSchema } from "./schemas.ts";

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
