import { useTransactionsGet } from "@/common/api/generate/transactions/transactions.gen.ts";
import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";
import { EditExpenseForm } from "@/modules/expenses";

import s from "./EditExpense.module.css";

type EditExpenseProps = {
  expenseId: number;
};

export function EditExpense({ expenseId }: EditExpenseProps) {
  const isValidExpenseId =
    Number.isInteger(expenseId) && Number.isFinite(expenseId) && expenseId > 0;
  const queryExpenseId = isValidExpenseId ? expenseId : 1;
  const { data: expense, isLoading, isError, error } = useTransactionsGet(
    queryExpenseId,
    {
      query: {
        enabled: isValidExpenseId,
      },
    },
  );

  if (!isValidExpenseId) {
    return (
      <div className={s.container}>
        <SimpleError>Некорректный идентификатор расхода</SimpleError>
      </div>
    );
  }

  if (isLoading) {
    return <div className={s.container}>Загрузка...</div>;
  }

  if (isError) {
    return (
      <div className={s.container}>
        {error?.message ?? "Не удалось загрузить расход"}
      </div>
    );
  }

  if (!expense) {
    return <div className={s.container}>Расход не найден</div>;
  }

  if (expense.type !== "expense") {
    return (
      <div className={s.container}>
        <SimpleError>Эта операция не является расходом</SimpleError>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <h1 className={s.title}>Редактировать расход</h1>
      <EditExpenseForm expense={expense} />
    </div>
  );
}
