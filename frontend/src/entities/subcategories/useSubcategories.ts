import { useEffect } from "react";

import { queryClient } from "@/kernel/api/appQuery";
import {
  getCategorySubcategoriesListQueryKey,
  useCategorySubcategoriesList,
} from "@/kernel/api/generate/subcategories/subcategories.gen.ts";
import { categorySubcategoriesListResponse } from "@/kernel/api/generate/subcategories/subcategories.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

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
      const validation = categorySubcategoriesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useSubcategoriesValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = categorySubcategoriesListResponse.safeParse(data);
  return { data: data && validation.success ? validation.data : [] };
}

export function useInvalidateSubcategories() {
  return (categoryId: number) =>
    queryClient.invalidateQueries({
      queryKey: getCategorySubcategoriesListQueryKey(categoryId),
    });
}
