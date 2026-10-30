import { useLayoutEffect, useRef, useState } from "react";

import type { TransactionDTO } from "@/common/api/generate/model";
import { Input } from "@/common/ui/input/Input";
import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";
import { useCategories } from "@/modules/categories";
import {
  getCurrentAccountIdSnapshot,
  getCurrentUserIdSnapshot,
} from "@/modules/user";

import { parseTransactionAmountInput } from "../../model/amount.ts";
import { useUpdateTransaction } from "../../model/use-update-transaction.ts";

import s from "./edit-transaction-form.module.css";

type EditTransactionFormProps = {
  actorId?: number;
  transaction: TransactionDTO;
  isUnavailable?: boolean;
  onRetryUnavailable?: () => Promise<boolean>;
  onSaved?: () => void;
};

function toLocalDateInputValue(isoDate: string) {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localDateInputToIso(localDate: string) {
  const [year, month, day] = localDate.split("-").map(Number);
  if (!year || !month || !day) throw new Error("Некорректная дата");
  return new Date(year, month - 1, day).toISOString();
}

function getErrorStatus(error: unknown) {
  return error !== null && typeof error === "object" && "statusCode" in error
    ? error.statusCode
    : undefined;
}

export function EditTransactionForm({
  actorId,
  transaction,
  isUnavailable = false,
  onRetryUnavailable,
  onSaved,
}: EditTransactionFormProps) {
  const baseline = useRef(transaction).current;
  const initialDate = useRef(toLocalDateInputValue(baseline.date)).current;
  const [amount, setAmount] = useState(String(baseline.amount));
  const [date, setDate] = useState(initialDate);
  const [description, setDescription] = useState(baseline.description ?? "");
  const [categoryId, setCategoryId] = useState(baseline.categoryId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [unavailableAfterSave, setUnavailableAfterSave] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const submitLock = useRef(false);
  const mounted = useRef(true);
  const categoriesQuery = useCategories({ type: baseline.type, sort: "usage" });
  const { updateTransaction, isLoading } = useUpdateTransaction(
    baseline.id,
    baseline.accountId,
    actorId,
  );
  const amountValue = parseTransactionAmountInput(amount);
  const canSubmit = amountValue !== null && amountValue > 0 && Boolean(date) && categoryId > 0;
  const unavailable = isUnavailable || unavailableAfterSave;
  const isBusy = isLoading || unavailable || checkingAvailability;

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const retryAvailability = async () => {
    if (!onRetryUnavailable || checkingAvailability) return;
    setCheckingAvailability(true);
    const isAvailable = await onRetryUnavailable();
    if (mounted.current) {
      setUnavailableAfterSave(!isAvailable);
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current || isBusy || amountValue === null) return;
    submitLock.current = true;
    setSaveError(null);
    try {
      await updateTransaction({
        type: baseline.type,
        amount: amountValue,
        categoryId,
        date: date === initialDate ? baseline.date : localDateInputToIso(date),
        description,
      });
      if (
        mounted.current &&
        (actorId === undefined || getCurrentUserIdSnapshot() === actorId) &&
        getCurrentAccountIdSnapshot() === baseline.accountId
      ) {
        onSaved?.();
      }
    } catch (error) {
      if (mounted.current) {
        const status = getErrorStatus(error);
        if (status === 403 || status === 404) {
          setUnavailableAfterSave(true);
          setSaveError("Операция недоступна. Проверьте доступ перед повторной попыткой.");
        } else {
          setSaveError("Не удалось сохранить операцию. Проверьте данные и повторите попытку.");
        }
      }
      submitLock.current = false;
    }
  };

  const categoryExists = categoriesQuery.data.some((category) => category.id === categoryId);

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <fieldset className={s.fields} disabled={isBusy}>
        <label className={s.field}>
          <span className={s.label}>Сумма</span>
          <Input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label className={s.field}>
          <span className={s.label}>Дата</span>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className={s.field}>
          <span className={s.label}>Комментарий</span>
          <Input type="text" placeholder="добавить комментарий" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className={s.field}>
          <span className={s.label}>Категория</span>
          {categoriesQuery.isLoading && !categoriesQuery.hasValidData ? (
            <span
              className={s.categoryLoading}
              role="status"
              aria-label="Загрузка категорий"
            >
              <Skeleton
                {...(s.categorySkeleton
                  ? { className: s.categorySkeleton }
                  : {})}
              />
            </span>
          ) : (
            <select className={s.select} value={categoryId} onChange={(event) => setCategoryId(Number(event.target.value))}>
              {!categoryExists && <option value={categoryId}>Текущая категория</option>}
              {categoriesQuery.data.length === 0 && <option value={categoryId}>Категории недоступны</option>}
              {categoriesQuery.data.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          )}
          {categoriesQuery.isFetching && categoriesQuery.hasValidData ? (
            <span
              className={s.message}
              role="status"
              aria-label="Обновляются категории"
            >
              Обновляются категории…
            </span>
          ) : null}
          {categoriesQuery.isError && <span className={s.message} role="status">Не удалось загрузить категории. Текущий выбор сохранён. <button className={s.inlineButton} type="button" onClick={() => void categoriesQuery.refetch()}>Повторить</button></span>}
        </label>
      </fieldset>
      {unavailable && <p className={s.message} role="alert">Операция недоступна. Изменения пока нельзя сохранить.</p>}
      {saveError && !unavailable && <p className={s.message} role="alert">{saveError}</p>}
      <div className={s.actions}>
        {unavailable && onRetryUnavailable ? <button className={s.submit} type="button" disabled={checkingAvailability} onClick={() => void retryAvailability()}>{checkingAvailability ? "Проверка..." : "Проверить доступ"}</button> : null}
        <button className={s.submit} type="submit" disabled={isBusy || !canSubmit}>{isLoading ? "Сохранение..." : "Сохранить"}</button>
      </div>
    </form>
  );
}
