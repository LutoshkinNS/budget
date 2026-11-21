import "@typespec/http";

using Http;

model Account {
  @minValue(1)
  id: integer;

  @minLength(1)
  name: string;

  initialBalance: float64;

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

  initialBalance?: float64;
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

model AccountErrorResponse {
  ...BadRequestResponse;
  ...Body<ValidationError>;
}

model AccountNoContentResponse {
  ...NoContentResponse;
}
