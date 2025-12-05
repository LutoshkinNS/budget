import { useMemo } from "react";

import { queryClient } from "@/kernel/api/appQuery";
import {
  getCategoriesListQueryKey,
  useCategoriesList,
} from "@/kernel/api/generate/categories/categories.gen.ts";
import { categoriesListResponse } from "@/kernel/api/generate/categories/categories.zod.gen.ts";

export function useCategories() {
  const query = useCategoriesList();

  const validatedData = useMemo(() => {
    if (!query.data) return [];

    try {
      return categoriesListResponse.parse(query.data);
    } catch (error) {
      console.error("Categories validation error:", error);
      return [];
    }
  }, [query.data]);

  return { ...query, data: validatedData };
}

export function useInvalidateCategories() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: getCategoriesListQueryKey(),
    });
}
