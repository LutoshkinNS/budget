import "@typespec/http";

using Http;

model Account {
  @minValue(1)
  id: integer;

  @minLength(1)
  name: string;

  @minValue(1)
  ownerId: integer;

  createdAt: utcDateTime;
}

model AccountCreate {
  @minLength(1)
  name: string;
}

model AccountUser {
  @minValue(1)
  userId: integer;

  @minValue(1)
  accountId: integer;

  joinedAt: utcDateTime;
}

model AccountErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model AccountNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model AccountNoContentResponse {
  ...NoContentResponse;
}
