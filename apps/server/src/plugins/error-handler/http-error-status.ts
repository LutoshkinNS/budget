export const HTTP_STATUS = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  payloadTooLarge: 413,
  unsupportedMediaType: 415,
  tooManyRequests: 429,
  clientErrorMinimum: 400,
  clientErrorMaximum: 499,
  serverErrorMinimum: 500,
  serverErrorMaximum: 599,
  internalServerError: 500
} as const;

const HTTP_STATUS_PROPERTY = {
  primary: 'status',
  fallback: 'statusCode'
} as const;

type HttpStatusError = {
  status?: unknown;
  statusCode?: unknown;
};

export function readHttpStatus(error: unknown): number | undefined {
  const status = readNumberProperty(error, HTTP_STATUS_PROPERTY.primary);
  if (isHttpErrorStatus(status)) return status;

  const statusCode = readNumberProperty(error, HTTP_STATUS_PROPERTY.fallback);
  return isHttpErrorStatus(statusCode) ? statusCode : undefined;
}

function readNumberProperty(
  value: unknown,
  property: keyof HttpStatusError
): number | undefined {
  if (typeof value !== 'object' || value === null) return undefined;

  try {
    const propertyValue: unknown = Reflect.get(value, property);
    return typeof propertyValue === 'number' ? propertyValue : undefined;
  } catch {
    return undefined;
  }
}

function isHttpErrorStatus(value: number | undefined): value is number {
  return (
    value !== undefined &&
    Number.isInteger(value) &&
    value >= HTTP_STATUS.clientErrorMinimum &&
    value <= HTTP_STATUS.serverErrorMaximum
  );
}
