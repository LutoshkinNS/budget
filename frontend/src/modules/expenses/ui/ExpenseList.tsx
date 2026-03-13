import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";

import { useExpenses } from "../useExpenses.ts";

export function ExpenseList() {
  const { data } = useExpenses();

  return (
    <FormBlock legend={"Список трат"}>
      <ul>
        {data.map((expense) => (
          <li key={expense.id}>
            {expense.amount}
            {expense.description ? ` - ${expense.description}` : null}
          </li>
        ))}
      </ul>
    </FormBlock>
  );
}
