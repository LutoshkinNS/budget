import "@typespec/http";

using Http;

enum CategoryIconKey {
  groceries,
  meals,
  clothes,
  sport,
  car,
  home,
  leisure,
  mobile,
  internet,
  gifts,
  publicTransport: "public-transport",
  pets,
  subscriptions,
  games,
  education,
  travel,
  taxi,
  apartment,
  health,
  beauty,
}

model Category {
  @minValue(1)
  id: integer;

  @minValue(1)
  accountId: integer;

  type: TransactionType;

  @minLength(1)
  name: string;

  iconKey: CategoryIconKey | null;
}

model CategoryCreate {
  type: TransactionType;

  @minLength(1)
  name: string;

  iconKey?: CategoryIconKey | null;
}

model CategoryUpdate {
  @minLength(1)
  name?: string;
  iconKey?: CategoryIconKey | null;
}

model CategoryErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model CategoryConflictResponse {
  @statusCode statusCode: 409;
  @body error: ConflictError;
}

model CategoryNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model CategoryNoContentResponse {
  ...NoContentResponse;
}
