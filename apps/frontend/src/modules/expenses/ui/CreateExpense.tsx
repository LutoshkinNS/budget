import { useState } from "react";

import { Input } from "@/common/ui/input/Input";
import { CategoriesKeyboard } from "@/modules/categories";

import { useCreateExpense } from "../model/useCreateExpense";
import { NumericKeyboard } from "../modules/numeric-keyboard";

import s from "./createExpense.module.css";

const IDS = {
  EXPENSE: {
    DESCRIPTION: "description",
  },
} as const;

export function CreateExpense() {
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");

  const { createExpense } = useCreateExpense();

  const handleSubmit = async (selectedCategoryId: number) => {
    await createExpense({
      amount: Number(amount),
      categoryId: selectedCategoryId,
      ...(!!description && { description }),
    });

    setAmount("0");
    setDescription("");
  };

  return (
    <div>
      <h3 className={s.title}>внести расход</h3>
      <NumericKeyboard
        value={amount}
        onChange={(value) => {
          setAmount(value);
        }}
      />
      <div className={s.fields}>
        <Input
          variant="borderless"
          type="text"
          placeholder="добавить комментарий"
          id={IDS.EXPENSE.DESCRIPTION}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth={false}
        />
      </div>
      <CategoriesKeyboard
        className={s.categories}
        value={null}
        onChange={(id) => {
          if (id !== null) handleSubmit(id);
        }}
      />
    </div>
  );
}
