import "@typespec/http";

using Http;

model LoginRequest {
  @minValue(1)
  id: integer;

  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;

  @minValue(1)
  auth_date: integer;

  hash: string;
}

model TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: integer;
}

model RefreshRequest {
  refreshToken: string;
}

model AccountInfo {
  @minValue(1)
  id: integer;
  name: string;
  isOwner: boolean;
}

model UserInfo {
  @minValue(1)
  userId: integer;

  @minValue(1)
  currentAccountId: integer;

  accounts: AccountInfo[];
}

@error
model UnauthorizedError extends BaseError {
  code: ErrorCode.UNAUTHORIZED | ErrorCode.INVALID_TOKEN | ErrorCode.MISSING_TOKEN;
  statusCode: 401;
}

@error
model AuthUnauthorizedResponse {
  @statusCode statusCode: 401;
  @body error: UnauthorizedError;
}

@error
model NoAccountError extends BaseError {
  code: ErrorCode.NO_ACCOUNT;
  statusCode: 409;
}

@error
model NoAccountResponse {
  @statusCode statusCode: 409;
  @body error: NoAccountError;
}

model SuccessResponse {
  success: boolean;
}
