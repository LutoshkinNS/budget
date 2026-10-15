export const CATEGORY_CONFLICT = {
  code: 'CATEGORY_ALREADY_EXISTS',
  message: 'Category already exists',
  statusCode: 409
} as const;

export const CATEGORY_NOT_FOUND = {
  code: 'NOT_FOUND',
  message: 'Category not found or access denied',
  statusCode: 404
} as const;

export const CATEGORY_INVALID_UPDATE = {
  code: 'VALIDATION_ERROR',
  message: 'Provide a non-empty name or an icon key',
  statusCode: 400
} as const;
