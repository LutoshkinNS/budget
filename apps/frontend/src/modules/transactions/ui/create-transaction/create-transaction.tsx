import { useState } from "react";

import { AccountAvatar } from "@/common/ui/account-avatar/AccountAvatar";
import { Input } from "@/common/ui/input/Input";
import { NumericKeyboard } from "@/common/ui/numeric-keyboard/ui/numeric-keyboard.tsx";
import { CategoriesKeyboard } from "@/modules/categories";
import { useMe } from "@/modules/user";

import { parseTransactionAmountInput } from "../../model/amount.ts";
import { useCreateTransaction } from "../../model/useCreateTransaction.ts";
import type { TransactionType } from "../../model/useTransactions.ts";

import s from "./create-transaction.module.css";

const IDS = {
  TRANSACTION: {
    DESCRIPTION: "description",
  },
} as const;

export function CreateTransaction() {
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TransactionType>("expense");

  const { createTransaction } = useCreateTransaction();
  const { data: me } = useMe();
  const currentAccount = me?.accounts.find((a) => a.id === me.currentAccountId);

  const handleSubmit = async (selectedCategoryId: number) => {
    const amountValue = parseTransactionAmountInput(amount);

    await createTransaction({
      amount: amountValue ?? Number.NaN,
      categoryId: selectedCategoryId,
      type,
      ...(!!description && { description }),
    });

    setAmount("0");
    setDescription("");
  };

  return (
    <div>
      <div className={s.header}>
        <h3 className={s.title}>
          внести {type === "expense" ? "расход" : "доход"}
        </h3>
        {currentAccount && <AccountAvatar name={currentAccount.name} />}
      </div>
      <div className={s.typeSwitch} role="group" aria-label="тип операции">
        <button
          className={type === "expense" ? s.typeSwitchActive : undefined}
          type="button"
          aria-pressed={type === "expense"}
          onClick={() => setType("expense")}
        >
          расход
        </button>
        <button
          className={type === "income" ? s.typeSwitchActive : undefined}
          type="button"
          aria-pressed={type === "income"}
          onClick={() => setType("income")}
        >
          доход
        </button>
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
          id={IDS.TRANSACTION.DESCRIPTION}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth={false}
        />
      </div>
      <CategoriesKeyboard
        className={s.categories}
        type={type}
        value={null}
        onChange={(id) => {
          if (id !== null) handleSubmit(id);
        }}
      />
    </div>
  );
}
