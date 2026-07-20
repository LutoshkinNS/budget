import "./../general.tsp";

using Http;

alias TransactionType = "income" | "expense";

model Transaction {
  @minValue(1)
  id: integer;

  @minValue(1)
  accountId: integer;

  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  @minValue(1)
  userId: integer;

  type: TransactionType;

  description?: string | null;
  date: utcDateTime;
}

model TransactionCreate {
  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  type: TransactionType;

  description?: string;

  date?: utcDateTime;
}

model TransactionUpdate {
  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  type: TransactionType;

  description?: string | null;

  date: utcDateTime;
}

model TransactionSummary {
  initialBalance: float64;
  incomeTotal: float64;
  expenseTotal: float64;
  periodBalance: float64;
  totalBalance: float64;
}

model CategoryExpenseSummary {
  @minValue(1)
  categoryId: integer;

  categoryName: string;
  amount: float64;
  percentage: float64;
  previousAmount: float64;
  changePercent: float64 | null;

  @minValue(0)
  transactionCount: integer;
}

model CategorySummary {
  totalExpense: float64;
  previousTotalExpense: float64;
  changePercent: float64 | null;

  @minValue(0)
  transactionCount: integer;
  categories: CategoryExpenseSummary[];
}

model TransactionErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model TransactionNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model TransactionNoContentResponse {
  ...NoContentResponse;
}
