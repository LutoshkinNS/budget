import "@typespec/http";

using Http;

enum BusinessErrorCode {
  INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
  CATEGORY_ALREADY_EXISTS: "CATEGORY_ALREADY_EXISTS"
}

model ErrorDTO {
  statusCode: float64;
  message: string;
  code?: BusinessErrorCode;
}

@error
model NotFoundError extends ErrorDTO {
  message: string = "Запрошенный ресурс не найден.";
  statusCode: float64 = 404;
}

model HttpNotFoundResponse {
  @statusCode statusCode: 404;
  @body error: NotFoundError;
}

@error
model ValidationError extends ErrorDTO {
  message: string = "Некорректные параметры запроса.";
  statusCode: float64 = 400;
}

model ValidationErrorResponse {
  @statusCode statusCode: 400;
  @body error: ValidationError;
}

@error
model UnauthorizedError extends ErrorDTO {
  message: string = "Требуется действительная авторизация.";
  statusCode: float64 = 401;
}

model AuthUnauthorizedResponse {
  @statusCode statusCode: 401;
  @body error: UnauthorizedError;
}

@error
model ForbiddenError extends ErrorDTO {
  message: string = "Недостаточно прав для выполнения запроса.";
  statusCode: float64 = 403;
}

model HttpForbiddenResponse {
  @statusCode statusCode: 403;
  @body error: ForbiddenError;
}

@error
model ConflictError extends ErrorDTO {
  message: string = "Не удалось выполнить запрос из-за конфликта.";
  statusCode: float64 = 409;
}

model HttpConflictResponse {
  @statusCode statusCode: 409;
  @body error: ConflictError;
}

@error
model RequestError extends ErrorDTO {
  message: string = "Не удалось обработать запрос.";
  statusCode: float64 = 400;
}

model RequestErrorResponse {
  @statusCode statusCode: 400;
  @body error: RequestError;
}

@error
model InternalServerError extends ErrorDTO {
  message: string = "Внутренняя ошибка сервера.";
  statusCode: float64 = 500;
}

model InternalServerErrorResponse {
  @statusCode statusCode: 500;
  @body error: InternalServerError;
}

@error
model PayloadTooLargeError extends ErrorDTO {
  message: string = "Размер запроса превышает допустимый.";
  statusCode: float64 = 413;
}

model PayloadTooLargeErrorResponse {
  @statusCode statusCode: 413;
  @body error: PayloadTooLargeError;
}

@error
model UnsupportedMediaTypeError extends ErrorDTO {
  message: string = "Неподдерживаемый формат данных запроса.";
  statusCode: float64 = 415;
}

model UnsupportedMediaTypeErrorResponse {
  @statusCode statusCode: 415;
  @body error: UnsupportedMediaTypeError;
}

@error
model TooManyRequestsError extends ErrorDTO {
  message: string = "Слишком много запросов. Повторите попытку позже.";
  statusCode: float64 = 429;
}

model TooManyRequestsResponse {
  @statusCode statusCode: 429;
  @body error: TooManyRequestsError;
}

@error
model CategoryAlreadyExistsError extends ErrorDTO {
  code: BusinessErrorCode.CATEGORY_ALREADY_EXISTS;
  message: string = "Категория с таким названием уже существует.";
  statusCode: 409;
}

model CategoryAlreadyExistsResponse {
  @statusCode statusCode: 409;
  @body error: CategoryAlreadyExistsError;
}

@error
model InvitationNotFoundError extends ErrorDTO {
  code: BusinessErrorCode.INVITATION_NOT_FOUND;
  message: string = "Приглашение не найдено или уже использовано.";
  statusCode: 404;
}

model InvitationNotFoundResponse {
  @statusCode statusCode: 404;
  @body error: InvitationNotFoundError;
}
