import { describe, expect, it } from 'vitest';

import CategoryAlreadyExistsError from '#s/CategoryAlreadyExistsError.js';
import ConflictError from '#s/ConflictError.js';
import ForbiddenError from '#s/ForbiddenError.js';
import InternalServerError from '#s/InternalServerError.js';
import InvitationNotFoundError from '#s/InvitationNotFoundError.js';
import NotFoundError from '#s/NotFoundError.js';
import PayloadTooLargeError from '#s/PayloadTooLargeError.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import UnsupportedMediaTypeError from '#s/UnsupportedMediaTypeError.js';
import ValidationError from '#s/ValidationError.js';

import {
  createBusinessErrorResponse,
  createErrorResponse
} from '../error-responses.js';

const VALIDATION_RESPONSE = {
  message: 'Некорректные параметры запроса.',
  statusCode: 400
} as const;
const DEFAULT_CASES = [
  {
    schema: ValidationError,
    status: 400,
    message: VALIDATION_RESPONSE.message
  },
  {
    schema: UnauthorizedError,
    status: 401,
    message: 'Требуется действительная авторизация.'
  },
  {
    schema: ForbiddenError,
    status: 403,
    message: 'Недостаточно прав для выполнения запроса.'
  },
  {
    schema: NotFoundError,
    status: 404,
    message: 'Запрошенный ресурс не найден.'
  },
  {
    schema: ConflictError,
    status: 409,
    message: 'Не удалось выполнить запрос из-за конфликта.'
  },
  {
    schema: InternalServerError,
    status: 503,
    message: 'Внутренняя ошибка сервера.'
  },
  {
    schema: PayloadTooLargeError,
    status: 413,
    message: 'Размер запроса превышает допустимый.'
  },
  {
    schema: UnsupportedMediaTypeError,
    status: 415,
    message: 'Неподдерживаемый формат данных запроса.'
  }
] as const;
const BUSINESS_CASES = [
  {
    schema: CategoryAlreadyExistsError,
    expected: {
      code: 'CATEGORY_ALREADY_EXISTS',
      statusCode: 409,
      message: 'Категория с таким названием уже существует.'
    }
  },
  {
    schema: InvitationNotFoundError,
    expected: {
      code: 'INVITATION_NOT_FOUND',
      statusCode: 404,
      message: 'Приглашение не найдено или уже использовано.'
    }
  }
] as const;
const INVALID_ENUM_SCHEMAS = [
  {
    name: 'empty code enum',
    properties: { ...CategoryAlreadyExistsError.properties, code: { enum: [] } }
  },
  {
    name: 'multiple code values',
    properties: {
      ...CategoryAlreadyExistsError.properties,
      code: { enum: ['CATEGORY_ALREADY_EXISTS', 'INVITATION_NOT_FOUND'] }
    }
  },
  {
    name: 'empty status enum',
    properties: {
      ...CategoryAlreadyExistsError.properties,
      statusCode: { enum: [] }
    }
  },
  {
    name: 'multiple status values',
    properties: {
      ...CategoryAlreadyExistsError.properties,
      statusCode: { enum: [409, 404] }
    }
  }
] as const;
const DOMAIN_MESSAGE = 'Доменный текст вместо общего.';

describe('schema-derived native error responses', () => {
  it.each(DEFAULT_CASES)(
    'uses the TypeSpec default for HTTP$status without a technical business code',
    ({ schema, status, message }) => {
      expect(createErrorResponse(schema, status)).toEqual({
        message,
        statusCode: status
      });
    }
  );

  it.each(BUSINESS_CASES)(
    'keeps the exact $expected.code code and status',
    ({ schema, expected }) => {
      expect(createBusinessErrorResponse(schema)).toEqual(expected);
      expect(createBusinessErrorResponse(schema, DOMAIN_MESSAGE)).toEqual({
        ...expected,
        message: DOMAIN_MESSAGE
      });
    }
  );

  it('keeps an explicit nonempty domain override', () => {
    expect(createErrorResponse(ValidationError, 400, DOMAIN_MESSAGE)).toEqual({
      ...VALIDATION_RESPONSE,
      message: DOMAIN_MESSAGE
    });
  });

  it.each(['', '   '])('rejects a blank domain override %j', (message) => {
    expect(() => createErrorResponse(ValidationError, 400, message)).toThrow(
      Error
    );
    expect(() =>
      createBusinessErrorResponse(CategoryAlreadyExistsError, message)
    ).toThrow(Error);
  });

  it.each(INVALID_ENUM_SCHEMAS)('fails fast on $name', ({ properties }) => {
    expect(() =>
      Reflect.apply(createBusinessErrorResponse, undefined, [{ properties }])
    ).toThrow(Error);
  });

  it.each([undefined, 17, '', '   '])(
    'fails fast on an invalid generated default %j',
    (defaultMessage) => {
      const schema = {
        properties: {
          ...ValidationError.properties,
          message: { default: defaultMessage }
        }
      };
      expect(() =>
        Reflect.apply(createErrorResponse, undefined, [schema, 400])
      ).toThrow(Error);
    }
  );
});
