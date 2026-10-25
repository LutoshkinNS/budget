import { accountKeys } from "@/common/api/query-keys";

export const subcategoryKeys = {
  all: (accountId: number) =>
    [...accountKeys.root(accountId), "subcategories"] as const,
  lists: (accountId: number) =>
    [...subcategoryKeys.all(accountId), "list"] as const,
  list: (accountId: number, categoryId: number) =>
    [...subcategoryKeys.lists(accountId), categoryId] as const,
};
