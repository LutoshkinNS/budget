import { useExpenses } from "@/entities/expense";
import { FormBlock } from "@/shared/ui/form-block";

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
