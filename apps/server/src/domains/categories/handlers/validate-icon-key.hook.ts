import type { preValidationAsyncHookHandler } from 'fastify';

import ValidationError from '#s/ValidationError.js';
import { createErrorResponse } from '#src/plugins/error-handler/error-responses.js';

import { isCategoryIconKey } from '../helpers/category-icon.js';

const invalidCategoryIconKeyMessage = 'Invalid category icon key';

// Проверка до AJV нужна, чтобы отклонить исходную пустую строку.
export const validateIconKey: preValidationAsyncHookHandler = async (
  req,
  reply
) => {
  const body = req.body;
  if (
    typeof body === 'object' &&
    body !== null &&
    'iconKey' in body &&
    body.iconKey !== null &&
    !isCategoryIconKey(body.iconKey)
  ) {
    const error = createErrorResponse(
      ValidationError,
      ValidationError.properties.statusCode.default,
      invalidCategoryIconKeyMessage
    );
    return reply.code(error.statusCode).send(error);
  }
};
