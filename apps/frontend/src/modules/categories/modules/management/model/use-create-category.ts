import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { ApiError } from "@/common/api/api-error.ts";
import { useCategoriesCreate } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesCreateBody } from "@/common/api/generate/categories/categories.zod.gen.ts";
import type { CategoryCreateDTO } from "@/common/api/generate/model";
import { BusinessErrorCodeDTO } from "@/common/api/generate/model/businessErrorCodeDTO.ts";
import { errorHandler } from "@/common/lib/error-handler/error-handler.ts";
import { requireCurrentAccountId } from "@/modules/user";

import { invalidateCategories } from "../../../model/category-cache.ts";

export type CategoryCreateData = Omit<CategoryCreateDTO, "type"> & {
  type?: CategoryCreateDTO["type"] | undefined;
};

export function getCreateCategoryErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return undefined;
  if (error.code === BusinessErrorCodeDTO.CATEGORY_ALREADY_EXISTS) {
    return "Категория с таким названием уже существует";
  }
  return error.message;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const mutation = useCategoriesCreate({
    mutation: {
      meta: { localFeedback: true },
      onSuccess: (_data, variables) => {
        void invalidateCategories(queryClient, variables.accountId);
      },
    },
  });

  const createCategory = async (data: CategoryCreateData) => {
    const validateResult = CategoriesCreateBody.safeParse({
      ...data,
      type: data.type ?? "expense",
    });

    if (!validateResult.success) {
      const fieldErrors = z.prettifyError(validateResult.error);
      errorHandler(fieldErrors);
      return;
    }

    return mutation.mutateAsync({
      accountId: requireCurrentAccountId(queryClient),
      data: {
        ...validateResult.data,
        iconKey: validateResult.data.iconKey ?? null,
      },
    });
  };

  return {
    createCategory,
    errorMessage: getCreateCategoryErrorMessage(mutation.error),
    ...mutation,
  };
}
