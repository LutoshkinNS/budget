import { BusinessErrorCodeDTO as BUSINESS_ERROR_CODE } from "./generate/model/businessErrorCodeDTO.ts";
import type { BusinessErrorCodeDTO } from "./generate/model/index.gen.ts";

export const API_ERROR_KIND = {
  http: "http",
  network: "network",
  invalidResponse: "invalid-response",
} as const;

export type ApiErrorKind = (typeof API_ERROR_KIND)[keyof typeof API_ERROR_KIND];

export type BaseError = {
  code?: BusinessErrorCodeDTO;
  message: string;
  statusCode: number;
};

type ApiErrorInput = BaseError & { kind: ApiErrorKind };

export class ApiError extends Error implements BaseError {
  public readonly kind: ApiErrorKind;
  public readonly code?: BusinessErrorCodeDTO;
  public readonly statusCode: number;

  constructor(error: ApiErrorInput) {
    super(error.message);
    this.name = "ApiError";
    this.kind = error.kind;
    if (error.code !== undefined) this.code = error.code;
    this.statusCode = error.statusCode;
  }

  getTextError(): string {
    return this.message;
  }
}

export const API_ERROR_FEEDBACK = {
  request: {
    title: "Не удалось выполнить запрос",
    message: "Не удалось выполнить запрос. Повторите попытку.",
  },
  invalidResponse: {
    title: "Не удалось выполнить запрос",
    message: "Сервер вернул некорректный ответ. Повторите попытку.",
  },
} as const;

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  return new ApiError({
    kind: API_ERROR_KIND.http,
    message: API_ERROR_FEEDBACK.request.message,
    statusCode: 0,
  });
}

export function createApiHttpError(body: unknown, httpStatus: number): ApiError {
  const parsed = parseApiHttpErrorBody(body, httpStatus);
  if (httpStatus >= 500 || !parsed) {
    return new ApiError({
      kind: API_ERROR_KIND.http,
      message: API_ERROR_FEEDBACK.request.message,
      statusCode: httpStatus,
    });
  }

  return new ApiError({
    kind: API_ERROR_KIND.http,
    ...(parsed.code !== undefined && { code: parsed.code }),
    message: parsed.message,
    statusCode: httpStatus,
  });
}

function parseApiHttpErrorBody(
  value: unknown,
  httpStatus: number,
): BaseError | undefined {
  if (
    !Number.isInteger(httpStatus) ||
    httpStatus < 400 ||
    httpStatus > 599 ||
    typeof value !== "object" ||
    value === null ||
    !("message" in value) ||
    typeof value.message !== "string" ||
    value.message.trim().length === 0 ||
    !("statusCode" in value) ||
    value.statusCode !== httpStatus
  ) {
    return undefined;
  }

  if ("code" in value) {
    if (!isBusinessErrorCode(value.code)) return undefined;
    return {
      code: value.code,
      message: value.message,
      statusCode: httpStatus,
    };
  }

  return { message: value.message, statusCode: httpStatus };
}

function isBusinessErrorCode(value: unknown): value is BusinessErrorCodeDTO {
  return Object.values(BUSINESS_ERROR_CODE).some((code) => code === value);
}

export function isCancellationError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError")
  );
}
