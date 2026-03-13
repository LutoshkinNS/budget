import { useRef } from "react";

import { useCreateExpense } from "../model/useCreateExpense";

type TCreateExpense = {
  CategoriesSlot: React.ReactNode;
};

const IDS = {
  CATEGORY: "category",
  EXPENSE: {
    VALUE: "value",
    DESCRIPTION: "description",
    DATE: "date",
  },
} as const;

const FIELD_VALUES = {
  AMOUNT: "amount",
  CATEGORY_ID: "category_id",
  DESCRIPTION: "description",
  DATE: "date",
} as const;

export function CreateExpense({ CategoriesSlot }: TCreateExpense) {
  const { createExpense } = useCreateExpense();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get(FIELD_VALUES.AMOUNT));
    const categoryId = Number(formData.get(FIELD_VALUES.CATEGORY_ID));
    const description = String(formData.get(FIELD_VALUES.DESCRIPTION));
    const date = String(formData.get(FIELD_VALUES.DATE));

    await createExpense({
      amount,
      categoryId,
      ...(!!date && { date: new Date(date).toISOString() }),
      ...(!!description && { description: description }),
    });
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
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
        <p>{CategoriesSlot}</p>
        <p>
          <label htmlFor={IDS.EXPENSE.DATE}>Дата</label>
          <input type="date" name={FIELD_VALUES.DATE} id={IDS.EXPENSE.DATE} />
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
