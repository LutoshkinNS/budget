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

model AccountUpdate {
  @minLength(1)
  name?: string;
}

@minValue(1)
scalar AccountId extends int64;

model AccountUser {
  @minValue(1)
  userId: integer;

  accountId: AccountId;

  joinedAt: utcDateTime;
}

model AccountInvitation {
  @minValue(1)
  id: integer;

  code: string;

  @minValue(1)
  accountId: integer;

  expiresAt: utcDateTime;
  usedAt?: utcDateTime;

  @minValue(1)
  usedBy?: integer;
}

model RedeemInvitationRequest {
  code: string;
}

@error
model ForbiddenError {
  code: ErrorCode.FORBIDDEN;
  message: string;
  statusCode: 403;
}

model AccountForbiddenResponse {
  @statusCode statusCode: 403;
  @body error: ForbiddenError;
}

@error
model InvitationNotFoundError {
  code: ErrorCode.INVITATION_NOT_FOUND;
  message: string;
  statusCode: 404;
}

model InvitationNotFoundResponse {
  @statusCode statusCode: 404;
  @body error: InvitationNotFoundError;
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
