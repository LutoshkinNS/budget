import type { preValidationAsyncHookHandler } from 'fastify';

import { isCategoryIconKey } from '../helpers/category-icon.js';

// Проверяем исходное значение: AJV может превратить пустую строку в null.
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
    return reply.code(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Invalid category icon key',
      statusCode: 400
    });
  }
};
