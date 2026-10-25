import { queryClient } from "@/common/api/appQuery";

import { categoryKeys } from "./category-keys.ts";

/**
 * Публичная cache-команда инвалидации categories: наружу — только scope,
 * состав ключей — приватная деталь фабрики categoryKeys. Счёт обязателен:
 * он приходит из variables мутации, тихий пропуск невозможен по построению.
 */
export function invalidateCategories(accountId: number, categoryId?: number) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: categoryKeys.lists(accountId),
    }),
    ...(categoryId === undefined
      ? []
      : [
          queryClient.invalidateQueries({
            queryKey: categoryKeys.detail(accountId, categoryId),
          }),
        ]),
  ]);
}
