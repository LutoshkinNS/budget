import { useEffect } from "react";

import { queryClient } from "@/kernel/api/appQuery";
import {
  getCategoriesListQueryKey,
  useCategoriesList,
} from "@/kernel/api/generate/categories/categories.gen.ts";
import { categoriesListResponse } from "@/kernel/api/generate/categories/categories.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

export function useCategories() {
  const { data, isError, error } = useCategoriesList();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useCategoriesError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = categoriesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useCategoriesValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = categoriesListResponse.safeParse(data);
  return { data: data && validation.success ? validation.data : [] };
}

export function useInvalidateCategories() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: getCategoriesListQueryKey(),
    });
}
