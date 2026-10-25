import { z } from "zod";

import { useCategoriesDelete } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesDeleteParams } from "@/common/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/common/lib/error-handler/error-handler.ts";
import { requireCurrentAccountId } from "@/modules/user";

import { invalidateCategories } from "./category-cache.ts";
import { deleteCategoryFormDataSchema } from "./schemas.ts";

export function useDeleteCategory() {
  const { mutate, isError, error, status } = useCategoriesDelete({
    mutation: {
      // Поздний ответ инвалидирует кэш счёта из variables вызова.
      onSuccess: async (_data, variables) => {
        await invalidateCategories(variables.accountId);
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

    const resultDtoParsed = CategoriesDeleteParams.safeParse({
      categoryId: resultParsedFormData.data?.categoryId,
    });

    if (!resultDtoParsed.success) {
      const fieldErrors = z.prettifyError(resultDtoParsed.error);
      errorHandler(fieldErrors);
      return;
    }

    mutate({
      accountId: requireCurrentAccountId(),
      categoryId: resultDtoParsed.data.categoryId,
    });
  };

  return { deleteCategory, isError, error, status };
}
