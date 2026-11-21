import CategoryAlreadyExistsError from '#s/CategoryAlreadyExistsError.js';
import NotFoundError from '#s/NotFoundError.js';
import ValidationError from '#s/ValidationError.js';
import {
  createBusinessErrorResponse,
  createErrorResponse
} from '#src/plugins/error-handler/error-responses.js';

export const CATEGORY_CONFLICT = createBusinessErrorResponse(
  CategoryAlreadyExistsError,
  'Category already exists'
);

export const CATEGORY_NOT_FOUND = createErrorResponse(
  NotFoundError,
  NotFoundError.properties.statusCode.default,
  'Category not found or access denied'
);

export const CATEGORY_INVALID_UPDATE = createErrorResponse(
  ValidationError,
  ValidationError.properties.statusCode.default,
  'Provide a non-empty name or an icon key'
);
