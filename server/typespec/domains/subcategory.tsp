import "./../general.tsp";

using Http;

model Subcategory {
  @minValue(1)
  id: integer;

  @minValue(1)
  userId: integer;

  @minValue(1)
  categoryId: integer;

  @minLength(1)
  name: string;
}

model SubcategoryListResponse {
  ...OkResponse;
  ...Body<Subcategory[]>;
}

model SubcategoryResponse {
  ...OkResponse;
  ...Body<Subcategory>;
}

model SubcategoryCreatedResponse {
  ...CreatedResponse;
  ...Body<Subcategory>;
}

model SubcategoryErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model SubcategoryNotFoundResponse {
  ...NotFoundResponse;
  ...Body<NotFoundError>;
}

model SubcategoryNoContentResponse {
  ...NoContentResponse;
}

model SubcategoryCreate {
  @minLength(1)
  name: string;
}