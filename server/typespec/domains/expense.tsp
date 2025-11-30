import "./../general.tsp";

using Http;

model Expense {
  @minValue(1)
  id: integer;

  @minValue(1)
  userId: integer;

  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  description?: string | null;
  date: utcDateTime;
}

model ExpenseCreate {
  @minValue(0.01)
  amount: float64;

  @minValue(1)
  categoryId: integer;

  description?: string;

  date?: utcDateTime;
}

model ExpenseErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model ExpenseNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model ExpenseNoContentResponse {
  ...NoContentResponse;
}