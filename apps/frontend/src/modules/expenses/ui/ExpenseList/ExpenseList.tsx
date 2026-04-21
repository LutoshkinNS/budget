import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useCategories } from "@/modules/categories";

import { useExpenses } from "../../useExpenses.ts";

export function ExpenseList() {
  const { data } = useExpenses();
  const { data: categories } = useCategories();

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <FormBlock legend={"Список трат"}>
      <ul>
        {data.map((expense) => (
          <li key={expense.id}>
            {expense.amount}
            {categoryMap.get(expense.categoryId)
              ? ` [${categoryMap.get(expense.categoryId)}]`
              : null}
            {expense.description ? ` - ${expense.description}` : null}
          </li>
        ))}
      </ul>
    </FormBlock>
  );
}
