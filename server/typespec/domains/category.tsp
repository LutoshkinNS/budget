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

model CategoryListResponse {
  ...OkResponse;
  ...Body<Category[]>;
}

model CategoryResponse {
  ...OkResponse;
  ...Body<Category>;
}

model CategoryCreatedResponse {
  ...CreatedResponse;
  ...Body<Category>;
}

model CategoryErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model CategoryNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model CategorySuccessResponse {
  ...OkResponse;
  ...Body<string>;
}

model CategoryNoContentResponse {
  ...NoContentResponse;
}

model CategoryCreate {
  @minLength(1)
  name: string;
}