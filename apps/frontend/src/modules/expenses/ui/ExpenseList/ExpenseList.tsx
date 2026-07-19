import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useCategories } from "@/modules/categories";

import { useExpenses } from "../../model/useExpenses.ts";

export function ExpenseList() {
  const { groups } = useExpenses();
  const { data: categories } = useCategories();

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const expenses = groups.flatMap((group) => group.expenses);

  return (
    <FormBlock legend={"Список трат"}>
      <ul>
        {expenses.map((expense) => (
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
