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
  initialBalance: float64;
  isOwner: boolean;
}

model UserInfo {
  @minValue(1)
  userId: integer;

  accounts: AccountInfo[];
}

@error
model UnauthorizedError {
  code: ErrorCode.UNAUTHORIZED | ErrorCode.INVALID_TOKEN | ErrorCode.MISSING_TOKEN;
  message: string;
  statusCode: 401;
}

@error
model AuthUnauthorizedResponse {
  @statusCode statusCode: 401;
  @body error: UnauthorizedError;
}

model SuccessResponse {
  success: boolean;
}

enum AuthClientEventName {
  page_loaded,
  widget_script_loaded,
  widget_script_failed,
  auth_callback,
  login_started,
  login_succeeded,
  login_failed,
  session_confirmed,
}

model AuthClientEvent {
  event: AuthClientEventName;
  buildVersion: string;
  attemptId?: string;
  displayMode: string;
  online: boolean;
}
