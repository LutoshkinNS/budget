import { useApiRuntime } from "@/common/api/api-runtime-context.tsx";
import { useCategoriesList } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesListResponse } from "@/common/api/generate/categories/categories.zod.gen.ts";
import type { CategoriesListParams } from "@/common/api/generate/model";
import { useCurrentAccountId } from "@/modules/user";

import { requestCategoriesList } from "./categories-endpoint.ts";
import { categoryKeys } from "./category-keys.ts";

export function useCategories(params?: CategoriesListParams) {
  const accountId = useCurrentAccountId();
  const { transport } = useApiRuntime();
  const query = useCategoriesList(accountId ?? 1, params, {
    query: {
      // exactOptionalPropertyTypes запрещает queryKey: undefined.
      ...(accountId !== undefined && {
        queryKey: categoryKeys.list(accountId, params),
      }),
      enabled: accountId != null,
      meta: { operation: "categoriesList" },
      queryFn: ({ signal }) => {
        if (accountId == null) {
          throw new Error("Cannot load categories without a selected account");
        }
        return requestCategoriesList(transport, accountId, params, signal);
      },
    },
  });
  const { data, isError } = query;

  const validation = CategoriesListResponse.safeParse(data);
  const hasValidData = data !== undefined && validation.success;
  const hasInvalidData = data !== undefined && !validation.success;

  return {
    ...query,
    data: hasValidData ? validation.data : [],
    hasAccount: accountId != null,
    hasValidData,
    // Disabled query остаётся isPending, поэтому isLoading ограничен счётом.
    isLoading: accountId != null && query.isLoading,
    isError: isError || hasInvalidData,
  };
}
