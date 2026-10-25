import { useEffect } from "react";

import { useCategoriesList } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesListResponse } from "@/common/api/generate/categories/categories.zod.gen.ts";
import type { CategoriesListParams } from "@/common/api/generate/model";
import { useNotifications } from "@/common/lib/notifications";
import { useCurrentAccountId } from "@/modules/user";

import { categoryKeys } from "./category-keys.ts";

export function useCategories(params?: CategoriesListParams) {
  const accountId = useCurrentAccountId();
  const { data, isError, error } = useCategoriesList(accountId ?? 1, params, {
    query: {
      // До загрузки me запрос отключён, ключ остаётся на generated-варианте;
      // с exactOptionalPropertyTypes нельзя передать queryKey: undefined,
      // поэтому условный spread
      ...(accountId !== undefined && {
        queryKey: categoryKeys.list(accountId, params),
      }),
      enabled: accountId != null,
    },
  });
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
