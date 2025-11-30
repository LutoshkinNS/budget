import { useMemo } from "react";
import { useCategoriesList } from "@/kernel/api/generate/categories/categories.gen.ts";
import { categoriesListResponse } from "@/kernel/api/generate/categories/categories.zod";

export function useCategories() {
  const query = useCategoriesList();

  const validatedData = useMemo(() => {
    if (!query.data) return undefined;

    try {
      return categoriesListResponse.parse(query.data);
    } catch (error) {
      console.error("Categories validation error:", error);
      return undefined;
    }
  }, [query.data]);

  return { ...query, data: validatedData };
}
