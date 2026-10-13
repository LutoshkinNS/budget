import { useState } from "react";

import type { TransactionDTO } from "@/common/api/generate/model";
import { Input } from "@/common/ui/input/Input";
import { useCategories } from "@/modules/categories";

import { parseTransactionAmountInput } from "../../model/amount.ts";
import { useUpdateTransaction } from "../../model/useUpdateTransaction.ts";

import s from "./edit-transaction-form.module.css";

type EditTransactionFormProps = {
  transaction: TransactionDTO;
};

function toLocalDateInputValue(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function localDateInputToIso(localDate: string) {
  const parts = localDate.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) {
    throw new Error("Некорректная дата");
  }

  return new Date(year, month - 1, day).toISOString();
}

function getSubmittedDateIso(
  currentDateInputValue: string,
  initialDateInputValue: string,
  originalIsoDate: string,
) {
  if (currentDateInputValue === initialDateInputValue) {
    return originalIsoDate;
  }

  return localDateInputToIso(currentDateInputValue);
}

export function EditTransactionForm({ transaction }: EditTransactionFormProps) {
  const initialDateInputValue = toLocalDateInputValue(transaction.date);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [date, setDate] = useState(initialDateInputValue);
  const [description, setDescription] = useState(transaction.description ?? "");
  const [categoryId, setCategoryId] = useState(transaction.categoryId);

  const { data: categories } = useCategories({ type: transaction.type });
  const { updateTransaction, isLoading } = useUpdateTransaction(transaction.id);
  const amountValue = parseTransactionAmountInput(amount);
  const canSubmit =
    amountValue !== null && amountValue > 0 && Boolean(date) && categoryId > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (amountValue === null) {
      return;
    }

    try {
      await updateTransaction({
        type: transaction.type,
        amount: amountValue,
        categoryId,
        date: getSubmittedDateIso(
          date,
          initialDateInputValue,
          transaction.date,
        ),
        description,
      });
    } catch {
      return;
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <label className={s.field}>
        <span className={s.label}>Сумма</span>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
        />
      </label>
      <label className={s.field}>
        <span className={s.label}>Дата</span>
        <Input
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
          }}
        />
      </label>
      <label className={s.field}>
        <span className={s.label}>Комментарий</span>
        <Input
          type="text"
          placeholder="добавить комментарий"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
        />
      </label>
      <label className={s.field}>
        <span className={s.label}>Категория</span>
        <select
          className={s.select}
          value={categoryId}
          onChange={(event) => {
            setCategoryId(Number(event.target.value));
          }}
        >
          {categories.length === 0 ? (
            <option value="">Категорий не найдено</option>
          ) : null}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className={s.actions}>
        <button
          className={s.submit}
          type="submit"
          disabled={isLoading || !canSubmit}
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
