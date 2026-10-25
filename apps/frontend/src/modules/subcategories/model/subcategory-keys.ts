import { accountKeys } from "@/common/api/query-keys";

/**
 * Иерархия ключей подкатегорий внутри поддерева счёта:
 * ['account', accountId, 'subcategories', 'list', categoryId].
 */
export const subcategoryKeys = {
  all: (accountId: number) =>
    [...accountKeys.root(accountId), "subcategories"] as const,
  lists: (accountId: number) =>
    [...subcategoryKeys.all(accountId), "list"] as const,
  list: (accountId: number, categoryId: number) =>
    [...subcategoryKeys.lists(accountId), categoryId] as const,
};
