import type { TransactionDTO } from "@/common/api/generate/model";
import {
  useInvalidateTransaction,
  useInvalidateTransactionsList,
  useTransactions,
} from "@/modules/transactions";

import {
  type ExpenseDateRange,
  getExpenseDateRange,
} from "../modules/period-summary";

export type ExpenseDTO = TransactionDTO;

export type ExpenseDayGroup = {
  label: string;
  isoDate: string;
  total: number;
  expenses: ExpenseDTO[];
};

export function useExpenses(
  range: ExpenseDateRange = getExpenseDateRange("day"),
) {
  const { groups, isLoading } = useTransactions({
    ...range,
    type: "expense",
  });

  return {
    groups: groups.map(({ transactions, ...group }) => ({
      ...group,
      expenses: transactions,
    })),
    isLoading,
  };
}

export function useInvalidateExpensesList() {
  const invalidateTransactionsList = useInvalidateTransactionsList();

  return () => invalidateTransactionsList();
}

export function useInvalidateExpense() {
  const invalidateTransaction = useInvalidateTransaction();

  return (expenseId: number) => invalidateTransaction(expenseId);
}
