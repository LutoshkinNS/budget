import { useCreateExpense } from "@/features/expenses/model/useCreateExpense.ts";
import { useCategories } from "@/entities/categories";

const IDS = {
  CATEGORY: "category",
  EXPENSE: {
    VALUE: "value",
    DESCRIPTION: "description",
  },
} as const;

const FIELD_VALUES = {
  AMOUNT: "amount",
  CATEGORY_ID: "category_id",
  DESCRIPTION: "description",
} as const;

export function Main() {
  const { createExpense } = useCreateExpense();
  const { data: categoriesResponse, status } = useCategories();

  console.log(categoriesResponse);

  const categories = status === "success" ? categoriesResponse : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get(FIELD_VALUES.AMOUNT));
    const categoryId = Number(formData.get(FIELD_VALUES.CATEGORY_ID));
    const description = String(formData.get(FIELD_VALUES.DESCRIPTION));

    await createExpense({
      amount,
      categoryId,
      // date: new Date().toISOString(),
      description,
    });

    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Добавление траты</legend>
        <p>
          <label htmlFor={IDS.EXPENSE.VALUE}>Сумма</label>
          <input
            type="number"
            name={FIELD_VALUES.AMOUNT}
            id={IDS.EXPENSE.VALUE}
          />
        </p>
        <p>
          <label htmlFor={IDS.CATEGORY}>Категория</label>
          <select name={FIELD_VALUES.CATEGORY_ID} id={IDS.CATEGORY}>
            <option value="">Выбери категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor={IDS.EXPENSE.DESCRIPTION}>Описание</label>
          <input
            type="text"
            name={FIELD_VALUES.DESCRIPTION}
            id={IDS.EXPENSE.DESCRIPTION}
          />
        </p>
        <p>
          <button type="submit">Добавить</button>
        </p>
      </fieldset>
    </form>
  );
}
