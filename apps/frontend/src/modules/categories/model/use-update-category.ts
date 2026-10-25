import { useCategoriesUpdate } from "@/common/api/generate/categories/categories.gen.ts";
import type { CategoryUpdateDTO } from "@/common/api/generate/model";
import { requireCurrentAccountId } from "@/modules/user";

import { invalidateCategories } from "./category-cache.ts";

export type CategoryUpdatedScope = {
  accountId: number;
  categoryId: number;
};

export type CategoryUpdatedCallback = (
  scope: CategoryUpdatedScope,
) => Promise<void> | void;

export function useUpdateCategory(options?: {
  onCategoryUpdated?: CategoryUpdatedCallback;
}) {
  const { mutateAsync: rawMutateAsync, ...rest } = useCategoriesUpdate({
    mutation: {
      // Поздний ответ инвалидирует кэш счёта из variables вызова.
      onSuccess: async (_category, variables) => {
        await invalidateCategories(variables.accountId, variables.categoryId);
        await options?.onCategoryUpdated?.({
          accountId: variables.accountId,
          categoryId: variables.categoryId,
        });
      },
    },
  });

  const mutateAsync = (
    variables: { categoryId: number; data: CategoryUpdateDTO },
    options?: Parameters<typeof rawMutateAsync>[1],
  ) =>
    rawMutateAsync(
      { accountId: requireCurrentAccountId(), ...variables },
      options,
    );

  return { mutateAsync, ...rest };
}
