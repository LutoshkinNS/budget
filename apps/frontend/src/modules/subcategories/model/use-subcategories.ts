import { useEffect } from "react";

import { queryClient } from "@/common/api/appQuery.ts";
import { useCategorySubcategoriesList } from "@/common/api/generate/subcategories/subcategories.gen.ts";
import { CategorySubcategoriesListResponse } from "@/common/api/generate/subcategories/subcategories.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { useCurrentAccountId } from "@/modules/user";

import { subcategoryKeys } from "./subcategory-keys.ts";

export function useSubcategories(categoryId: number) {
  const accountId = useCurrentAccountId();
      // Placeholder безопасен при отключённом запросе.
  const { data, isError, error } = useCategorySubcategoriesList(
    accountId ?? 1,
    categoryId,
    {
      query: {
        // exactOptionalPropertyTypes запрещает queryKey: undefined.
        ...(accountId !== undefined && {
          queryKey: subcategoryKeys.list(accountId, categoryId),
        }),
        enabled: accountId != null,
      },
    },
  );
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
  return (accountId: number, categoryId: number) =>
    queryClient.invalidateQueries({
      queryKey: subcategoryKeys.list(accountId, categoryId),
    });
}
