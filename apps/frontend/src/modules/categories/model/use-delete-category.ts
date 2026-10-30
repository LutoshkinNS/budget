import { z } from "zod";

import { useCategoriesDelete } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesDeleteParams } from "@/common/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/common/lib/error-handler/error-handler.ts";
import { requireCurrentAccountId } from "@/modules/user";

import { invalidateCategories } from "./category-cache.ts";
import { deleteCategoryFormDataSchema } from "./schemas.ts";

export function useDeleteCategory() {
  const mutation = useCategoriesDelete({
    mutation: {
      meta: { localFeedback: true },
      onSuccess: (_data, variables) => {
        void invalidateCategories(variables.accountId);
      },
    },
  });

  const deleteCategory = async (categoryId: string) => {
    const resultParsedFormData = deleteCategoryFormDataSchema.safeParse({
      categoryId,
    });

    if (!resultParsedFormData.success) {
      const fieldErrors = z.prettifyError(resultParsedFormData.error);
      errorHandler(fieldErrors);
      return;
    }

    const accountId = requireCurrentAccountId();
    const resultDtoParsed = CategoriesDeleteParams.safeParse({
      accountId,
      categoryId: resultParsedFormData.data?.categoryId,
    });

    if (!resultDtoParsed.success) {
      const fieldErrors = z.prettifyError(resultDtoParsed.error);
      errorHandler(fieldErrors);
      return;
    }

    return await mutation.mutateAsync({
      accountId: resultDtoParsed.data.accountId,
      categoryId: resultDtoParsed.data.categoryId,
    });
  };

  return { deleteCategory, ...mutation };
}
