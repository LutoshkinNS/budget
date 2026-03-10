import "@typespec/http";

using Http;

enum ErrorCode {
  MISSING_TOKEN: "MISSING_TOKEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  NO_ACCOUNT: "NO_ACCOUNT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
  ALREADY_MEMBER: "ALREADY_MEMBER",
  FORBIDDEN: "FORBIDDEN"
}

@error
model NotFoundError {
  code: ErrorCode.NOT_FOUND;
  message: string;
  statusCode: 404;
}

@error
model ValidationError {
  code: ErrorCode.VALIDATION_ERROR;
  message: string;
  statusCode: 400;
}

@error
model InternalServerError {
  code: ErrorCode.INTERNAL_SERVER_ERROR;
  message: string;
  statusCode: 500;
}

model InternalServerErrorResponse {
  @statusCode statusCode: 500;
  @body error: InternalServerError;
}
