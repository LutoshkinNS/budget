import type { QueryClient } from "@tanstack/react-query";

import { categoryKeys } from "./category-keys.ts";

export function invalidateCategories(
  queryClient: QueryClient,
  accountId: number,
  categoryId?: number,
) {
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
