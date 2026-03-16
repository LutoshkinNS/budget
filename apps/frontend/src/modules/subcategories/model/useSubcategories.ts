import { useEffect } from "react";

import { queryClient } from "@/common/api/appQuery.ts";
import {
  getCategorySubcategoriesListQueryKey,
  useCategorySubcategoriesList,
} from "@/common/api/generate/subcategories/subcategories.gen.ts";
import { CategorySubcategoriesListResponse } from "@/common/api/generate/subcategories/subcategories.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

export function useSubcategories(categoryId: number) {
  const { data, isError, error } = useCategorySubcategoriesList(categoryId);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useSubcategoriesError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = CategorySubcategoriesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useSubcategoriesValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = CategorySubcategoriesListResponse.safeParse(data);
  return { data: data && validation.success ? validation.data : [] };
}

export function useInvalidateSubcategories() {
  return (categoryId: number) =>
    queryClient.invalidateQueries({
      queryKey: getCategorySubcategoriesListQueryKey(categoryId),
    });
}
