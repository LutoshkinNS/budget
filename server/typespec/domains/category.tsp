import "@typespec/http";

using Http;

model Category {
  @minValue(1)
  id: integer;

  @minValue(1)
  userId: integer;

  @minLength(1)
  name: string;
}

model CategoryCreate {
  @minLength(1)
  name: string;
}

model CategoryErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model CategoryNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model CategoryNoContentResponse {
  ...NoContentResponse;
}