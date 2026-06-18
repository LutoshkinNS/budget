import { useState } from "react";

import type { CategoryType } from "@/modules/categories";
import {
  CategoriesList,
  CreateCategory,
  DeleteCategory,
} from "@/modules/categories";

export function Categories() {
  const [type, setType] = useState<CategoryType>("expense");

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
      <CategoriesList type={type} />
      <CreateCategory type={type} />
      <DeleteCategory type={type} />
    </div>
  );
}
