import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";
import { EditTransactionForm, useTransaction } from "@/modules/transactions";

import s from "./edit-transaction.module.css";

type EditTransactionProps = {
  transactionId: number;
};

export function EditTransaction({ transactionId }: EditTransactionProps) {
  const {
    data: transaction,
    isLoading,
    isError,
    error,
    isValidTransactionId,
  } = useTransaction(transactionId);

  if (!isValidTransactionId) {
    return (
      <div className={s.container}>
        <SimpleError>Некорректный идентификатор операции</SimpleError>
      </div>
    );
  }

  if (isLoading) {
    return <div className={s.container}>Загрузка...</div>;
  }

  if (isError) {
    return (
      <div className={s.container}>
        {error?.message ?? "Не удалось загрузить операцию"}
      </div>
    );
  }

  if (!transaction) {
    return <div className={s.container}>Операция не найдена</div>;
  }

  return (
    <div className={s.container}>
      <h1 className={s.title}>
        Редактировать {transaction.type === "income" ? "доход" : "расход"}
      </h1>
      <EditTransactionForm key={transaction.id} transaction={transaction} />
    </div>
  );
}
