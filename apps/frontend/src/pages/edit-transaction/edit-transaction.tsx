import { SimpleError } from "@/common/ui/simple-error/SimpleError.tsx";
import { Skeleton } from "@/common/ui/skeleton/skeleton.tsx";
import { EditTransactionForm, useTransaction } from "@/modules/transactions";
import { useMe } from "@/modules/user";

import s from "./edit-transaction.module.css";

type EditTransactionProps = {
  transactionId: number;
  onSaved?: () => void;
};

export function EditTransaction({ transactionId, onSaved }: EditTransactionProps) {
  const transactionQuery = useTransaction(transactionId);
  const { data: me } = useMe();
  const retry = () => void transactionQuery.refetch();

  return (
    <main className={s.container}>
      <h1 className={s.title}>Редактировать операцию</h1>
      {!transactionQuery.isValidTransactionId ? (
        <SimpleError>Некорректный идентификатор операции</SimpleError>
      ) : !transactionQuery.hasAccount ? (
        <SimpleError>Счёт не выбран</SimpleError>
      ) : transactionQuery.isLoading ? (
        <div className={s.skeleton} role="status" aria-label="Загрузка операции">
          <Skeleton {...(s.fieldSkeleton ? { className: s.fieldSkeleton } : {})} />
          <Skeleton {...(s.fieldSkeleton ? { className: s.fieldSkeleton } : {})} />
          <Skeleton {...(s.fieldSkeleton ? { className: s.fieldSkeleton } : {})} />
          <Skeleton {...(s.fieldSkeleton ? { className: s.fieldSkeleton } : {})} />
          <Skeleton {...(s.buttonSkeleton ? { className: s.buttonSkeleton } : {})} />
        </div>
      ) : transactionQuery.isForbidden ? (
        <section className={s.error}>
          <SimpleError>Нет доступа к этой операции</SimpleError>
          <button className={s.retry} type="button" onClick={retry}>
            Повторить
          </button>
        </section>
      ) : transactionQuery.isError && !transactionQuery.hasValidData ? (
        <section className={s.error}>
          <SimpleError>{transactionQuery.isNotFound ? "Операция не найдена" : "Не удалось загрузить операцию"}</SimpleError>
          <button className={s.retry} type="button" onClick={retry}>Повторить</button>
        </section>
      ) : transactionQuery.data ? (
        <>
          {transactionQuery.isFetching ? (
            <p className={s.message} role="status" aria-label="Обновляются данные операции">
              Обновляются данные операции…
            </p>
          ) : null}
          {transactionQuery.isError && !transactionQuery.isNotFound ? (
            <section className={s.error} role="alert">
              <p>Не удалось обновить данные операции.</p>
              <button className={s.retry} type="button" onClick={retry}>Повторить</button>
            </section>
          ) : null}
          <EditTransactionForm
            key={`${me?.userId}:${transactionQuery.data.accountId}:${transactionQuery.data.id}`}
            {...(me?.userId !== undefined ? { actorId: me.userId } : {})}
            transaction={transactionQuery.data}
            isUnavailable={transactionQuery.isNotFound}
            onRetryUnavailable={async () => {
              const result = await transactionQuery.refetch();
              return result.data !== undefined && !result.isError;
            }}
            {...(onSaved ? { onSaved } : {})}
          />
        </>
      ) : null}
    </main>
  );
}
