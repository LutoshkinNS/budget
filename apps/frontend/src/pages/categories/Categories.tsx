import { useCallback, useState } from "react";

import type { CategoryType } from "@/modules/categories";
import {
  CategoriesList,
  CreateCategory,
  DeleteCategory,
} from "@/modules/categories";
import { invalidateTransactionsCategorySummary } from "@/modules/transactions";

export function Categories() {
  const [type, setType] = useState<CategoryType>("expense");

  // Отчёты показывают имя категории, поэтому после переименования их кэш обновляется.
  const handleCategoryUpdated = useCallback(
    async ({ accountId }: { accountId: number }) => {
      await invalidateTransactionsCategorySummary(accountId);
    },
    [],
  );

  return (
    <div>
      <fieldset>
        <legend>Тип категорий</legend>
        <button
          type="button"
          aria-pressed={type === "expense"}
          onClick={() => setType("expense")}
        >
          расходы
        </button>
        <button
          type="button"
          aria-pressed={type === "income"}
          onClick={() => setType("income")}
        >
          доходы
        </button>
      </fieldset>
      <CategoriesList
        key={`list-${type}`}
        type={type}
        onCategoryUpdated={handleCategoryUpdated}
      />
      <CreateCategory key={`create-${type}`} type={type} />
      <DeleteCategory key={`delete-${type}`} type={type} />
    </div>
  );
}
