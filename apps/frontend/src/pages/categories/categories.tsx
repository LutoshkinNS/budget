import { useCallback, useState } from "react";

import type { CategoryType } from "@/modules/categories";
import {
  CategoriesList,
  CreateCategory,
  DeleteCategory,
} from "@/modules/categories";
import { invalidateTransactionsCategorySummary } from "@/modules/transactions";
import { useCurrentAccountId } from "@/modules/user";

export function Categories() {
  const accountId = useCurrentAccountId();
  const [type, setType] = useState<CategoryType>("expense");

  const handleCategoryUpdated = useCallback(
    ({ accountId }: { accountId: number }) => {
      void invalidateTransactionsCategorySummary(accountId);
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
        key={`list-${accountId ?? "no-account"}-${type}`}
        type={type}
        onCategoryUpdated={handleCategoryUpdated}
      />
      <CreateCategory
        key={`create-${accountId ?? "no-account"}-${type}`}
        type={type}
      />
      <DeleteCategory
        key={`delete-${accountId ?? "no-account"}-${type}`}
        type={type}
      />
    </div>
  );
}
