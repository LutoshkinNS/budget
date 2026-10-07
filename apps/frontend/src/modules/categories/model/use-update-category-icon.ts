import { useCategoriesUpdate } from "@/common/api/generate/categories/categories.gen.ts";

import { useInvalidateCategories } from "./useCategories";

export function useUpdateCategoryIcon() {
  const invalidateCategories = useInvalidateCategories();
  return useCategoriesUpdate({
    mutation: {
      onSuccess: async (_category, variables) => {
        await invalidateCategories(variables.categoryId);
      },
    },
  });
}
