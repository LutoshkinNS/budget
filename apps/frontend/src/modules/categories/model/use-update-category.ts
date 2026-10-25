import { useCategoriesUpdate } from "@/common/api/generate/categories/categories.gen.ts";
import type { CategoryUpdateDTO } from "@/common/api/generate/model";
import { requireCurrentAccountId } from "@/modules/user";

import { invalidateCategories } from "./category-cache.ts";

/** Скоп завершённого обновления категории; счёт неизменяемо принадлежит мутации. */
export type CategoryUpdatedScope = {
  accountId: number;
  categoryId: number;
};

/** Подключается точкой композиции сценария; Promise ожидается мутацией. */
export type CategoryUpdatedCallback = (
  scope: CategoryUpdatedScope,
) => Promise<void> | void;

export function useUpdateCategory(options?: {
  onCategoryUpdated?: CategoryUpdatedCallback;
}) {
  const { mutateAsync: rawMutateAsync, ...rest } = useCategoriesUpdate({
    mutation: {
      // Счёт мутации фиксируется её variables — переключение счёта не меняет
      // ни выполнение запроса, ни область инвалидаций
      onSuccess: async (_category, variables) => {
        await invalidateCategories(variables.accountId, variables.categoryId);
        await options?.onCategoryUpdated?.({
          accountId: variables.accountId,
          categoryId: variables.categoryId,
        });
      },
    },
  });

  // accountId внедряется в момент вызова из выбранного счёта
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
