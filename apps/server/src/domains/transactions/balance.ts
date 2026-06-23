export type TransactionSummaryInput = {
  initialBalance: number;
  periodIncomeTotal: number;
  periodExpenseTotal: number;
  balanceIncomeTotal: number;
  balanceExpenseTotal: number;
};

export type TransactionSummaryResult = {
  initialBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  periodBalance: number;
  totalBalance: number;
};

export function calculateTransactionSummary({
  initialBalance,
  periodIncomeTotal,
  periodExpenseTotal,
  balanceIncomeTotal,
  balanceExpenseTotal
}: TransactionSummaryInput): TransactionSummaryResult {
  return {
    initialBalance,
    incomeTotal: periodIncomeTotal,
    expenseTotal: periodExpenseTotal,
    periodBalance: periodIncomeTotal - periodExpenseTotal,
    totalBalance: initialBalance + balanceIncomeTotal - balanceExpenseTotal
  };
}
