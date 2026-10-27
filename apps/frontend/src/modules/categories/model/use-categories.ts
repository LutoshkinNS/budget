import { useEffect } from "react";

import { useCategoriesList } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesListResponse } from "@/common/api/generate/categories/categories.zod.gen.ts";
import type { CategoriesListParams } from "@/common/api/generate/model";
import { useNotifications } from "@/common/lib/notifications";
import { useCurrentAccountId } from "@/modules/user";

import { categoryKeys } from "./category-keys.ts";

export function useCategories(params?: CategoriesListParams) {
  const accountId = useCurrentAccountId();
  const query = useCategoriesList(
    accountId ?? 1,
    params,
    {
      query: {
        // exactOptionalPropertyTypes запрещает queryKey: undefined.
        ...(accountId !== undefined && {
          queryKey: categoryKeys.list(accountId, params),
        }),
        enabled: accountId != null,
      },
    },
  );
  const { data, isError, error } = query;
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
  return {
    ...query,
    data: data && validation.success ? validation.data : [],
  };
}
