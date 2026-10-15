import { queryClient } from "@/common/api/appQuery";
import { useCategoriesUpdate } from "@/common/api/generate/categories/categories.gen.ts";
import { getTransactionsCategorySummaryQueryKey } from "@/common/api/generate/transactions/transactions.gen";

import { useInvalidateCategories } from "./useCategories";

export function useUpdateCategory() {
  const invalidateCategories = useInvalidateCategories();
  return useCategoriesUpdate({
    mutation: {
      onSuccess: async (_category, variables) => {
        await Promise.all([
          invalidateCategories(variables.categoryId),
          queryClient.invalidateQueries({
            queryKey: getTransactionsCategorySummaryQueryKey(),
          }),
        ]);
      },
    },
  });
}
