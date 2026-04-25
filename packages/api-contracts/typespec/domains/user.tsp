import "./../general.tsp";

using Http;

model User {
  @minValue(1)
  id: integer;
  firstName?: string | null;
  photoUrl?: string | null;
  createdAt: utcDateTime;
}

model AccountMember {
  @minValue(1)
  userId: integer;
  firstName?: string | null;
  photoUrl?: string | null;
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
