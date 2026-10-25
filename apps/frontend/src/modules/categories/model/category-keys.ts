import type { CategoriesListParams } from "@/common/api/generate/model";
import { accountKeys } from "@/common/api/query-keys";

export const categoryKeys = {
  all: (accountId: number) =>
    [...accountKeys.root(accountId), "categories"] as const,
  lists: (accountId: number) =>
    [...categoryKeys.all(accountId), "list"] as const,
  list: (accountId: number, params?: CategoriesListParams) =>
    [...categoryKeys.lists(accountId), params ?? null] as const,
  details: (accountId: number) =>
    [...categoryKeys.all(accountId), "detail"] as const,
  detail: (accountId: number, categoryId: number) =>
    [...categoryKeys.details(accountId), categoryId] as const,
};
