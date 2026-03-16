import "./../general.tsp";

using Http;

model User {
  @minValue(1)
  id: integer;
  createdAt: utcDateTime;
}

model UserErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model UserNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model UserNoContentResponse {
  ...NoContentResponse;
}
