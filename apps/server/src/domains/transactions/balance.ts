export type TransactionSummaryInput = {
  initialBalance: number;
  periodIncomeTotal: number;
  periodExpenseTotal: number;
  allIncomeTotal: number;
  allExpenseTotal: number;
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
  allIncomeTotal,
  allExpenseTotal
}: TransactionSummaryInput): TransactionSummaryResult {
  return {
    initialBalance,
    incomeTotal: periodIncomeTotal,
    expenseTotal: periodExpenseTotal,
    periodBalance: periodIncomeTotal - periodExpenseTotal,
    totalBalance: initialBalance + allIncomeTotal - allExpenseTotal
  };
}
