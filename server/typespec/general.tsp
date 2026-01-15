import "@typespec/http";

using Http;

enum ErrorCode {
  MISSING_TOKEN: "MISSING_TOKEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  NO_ACCOUNT: "NO_ACCOUNT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
}

@error
model BaseError {
  code: ErrorCode;
  message: string;
  statusCode: integer;
}

@error
model NotFoundError extends BaseError {
  code: ErrorCode.NOT_FOUND;
  statusCode: 404;
}

@error
model ValidationError extends BaseError {
  code: ErrorCode.VALIDATION_ERROR;
  statusCode: 400;
}

@error
model InternalServerError extends BaseError {
  code: ErrorCode.INTERNAL_SERVER_ERROR;
  statusCode: 500;
}

model InternalServerErrorResponse {
  @statusCode statusCode: 500;
  @body error: InternalServerError;
}
