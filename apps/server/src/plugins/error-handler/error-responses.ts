type GeneratedMessageSchema = {
  properties: {
    message: { default: string };
  };
};

type GeneratedBusinessErrorSchema<Code extends string, Status extends number> = {
  properties: {
    code: { enum: readonly [Code] };
    message: { default: string };
    statusCode: { enum: readonly [Status] };
  };
};

export function createErrorResponse<Status extends number>(
  schema: GeneratedMessageSchema,
  statusCode: Status,
  message?: string
): { message: string; statusCode: Status } {
  return {
    message: getMessage(schema, message),
    statusCode
  };
}

export function createBusinessErrorResponse<
  Code extends string,
  Status extends number
>(
  schema: GeneratedBusinessErrorSchema<Code, Status>,
  message?: string
): { code: Code; message: string; statusCode: Status } {
  return {
    code: getSingleValue(schema.properties.code.enum),
    message: getMessage(schema, message),
    statusCode: getSingleValue(schema.properties.statusCode.enum)
  };
}

function getDefaultMessage(schema: GeneratedMessageSchema): string {
  const message = schema.properties.message.default;

  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Invalid generated error response message metadata.');
  }

  return message;
}

function getMessage(
  schema: GeneratedMessageSchema,
  message: string | undefined
): string {
  const resolvedMessage = message ?? getDefaultMessage(schema);

  if (resolvedMessage.trim().length === 0) {
    throw new Error('Error response message must not be empty.');
  }

  return resolvedMessage;
}

function getSingleValue<Value>(values: readonly [Value]): Value {
  if (values.length !== 1) {
    throw new Error('Invalid generated business error metadata.');
  }

  return values[0];
}
