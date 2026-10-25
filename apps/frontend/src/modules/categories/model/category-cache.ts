import { queryClient } from "@/common/api/appQuery";

import { categoryKeys } from "./category-keys.ts";

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
