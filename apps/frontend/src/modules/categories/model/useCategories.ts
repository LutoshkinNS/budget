import { useEffect } from "react";

import { queryClient } from "@/common/api/appQuery";
import {
  getCategoriesListQueryKey,
  useCategoriesList,
} from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesListResponse } from "@/common/api/generate/categories/categories.zod.gen.ts";
import type { CategoriesListParams } from "@/common/api/generate/model";
import { useNotifications } from "@/common/lib/notifications";

export function useCategories(params?: CategoriesListParams) {
  const { data, isError, error } = useCategoriesList(params);
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
      const validation = CategoriesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useCategoriesValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = CategoriesListResponse.safeParse(data);
  return { data: data && validation.success ? validation.data : [] };
}

export function useInvalidateCategories() {
  return (params?: CategoriesListParams) =>
    queryClient.invalidateQueries({
      queryKey: getCategoriesListQueryKey(params),
    });
}
