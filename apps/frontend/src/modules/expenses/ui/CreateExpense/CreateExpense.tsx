import { useState } from "react";

import { AccountAvatar } from "@/common/ui/account-avatar/AccountAvatar";
import { Input } from "@/common/ui/input/Input";
import { CategoriesKeyboard } from "@/modules/categories";
import { useMe } from "@/modules/user";

import { useCreateExpense } from "../../model/useCreateExpense";
import { NumericKeyboard } from "../../modules/numeric-keyboard";

import s from "./CreateExpense.module.css";

const IDS = {
  EXPENSE: {
    DESCRIPTION: "description",
  },
} as const;

export function CreateExpense() {
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");

  const { createExpense } = useCreateExpense();
  const { data: me } = useMe();
  const currentAccount = me?.accounts.find(
    (a) => a.id === me.currentAccountId,
  );

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
      <div className={s.header}>
        <h3 className={s.title}>внести расход</h3>
        {currentAccount && <AccountAvatar name={currentAccount.name} />}
      </div>
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
