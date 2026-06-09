import { z } from "zod";

import { useCategoriesCreate } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesCreateBody } from "@/common/api/generate/categories/categories.zod.gen.ts";
import { errorHandler } from "@/common/lib/error-handler/error-handler.ts";

import { useInvalidateCategories } from "../useCategories.ts";

export type CategoryCreateData = z.infer<typeof CategoriesCreateBody>;

function getCreateCategoryErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;

    if (code === "CATEGORY_ALREADY_EXISTS") {
      return "Категория с таким названием уже существует";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return undefined;
}

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

    try {
      return await mutation.mutateAsync({ data: validateResult.data });
    } catch (error) {
      const errorMessage = getCreateCategoryErrorMessage(error);

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      throw error;
    }
  };

  return {
    createCategory,
    errorMessage: getCreateCategoryErrorMessage(mutation.error),
    ...mutation,
  };
}
