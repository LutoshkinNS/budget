import "./../general.tsp";

using Http;

model Subcategory {
  @minValue(1)
  id: integer;

  @minValue(1)
  categoryId: integer;

  @minLength(1)
  name: string;
}

model SubcategoryCreate {
  @minValue(1)
  categoryId: integer;

  @minLength(1)
  name: string;
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
