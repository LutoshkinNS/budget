import { expectTypeOf, it } from 'vitest';

import CategoryAlreadyExistsError from '#s/CategoryAlreadyExistsError.js';
import InvitationNotFoundError from '#s/InvitationNotFoundError.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import ValidationError from '#s/ValidationError.js';

import {
  createBusinessErrorResponse,
  createErrorResponse
} from '../error-responses.js';
import type { PublicErrorResponse } from '../types.js';

type CategoryCode = (typeof CategoryAlreadyExistsError.properties.code.enum)[0];
type InvitationCode = (typeof InvitationNotFoundError.properties.code.enum)[0];

it('allows a technical error without a business code and preserves the selected literal HTTP status', () => {
  const validation = createErrorResponse(ValidationError, 400);
  const unauthorized = createErrorResponse(UnauthorizedError, 401);
  expectTypeOf(validation.statusCode).toEqualTypeOf<400>();
  expectTypeOf(validation.message).toEqualTypeOf<string>();
  expectTypeOf(unauthorized.statusCode).toEqualTypeOf<401>();
  expectTypeOf(validation).toExtend<PublicErrorResponse>();
  expectTypeOf(unauthorized).toExtend<PublicErrorResponse>();
});

it('preserves exact generated business code and status types with a free string message', () => {
  const category = createBusinessErrorResponse(CategoryAlreadyExistsError);
  const invitation = createBusinessErrorResponse(InvitationNotFoundError);
  expectTypeOf(category.code).toEqualTypeOf<CategoryCode>();
  expectTypeOf(category.statusCode).toEqualTypeOf<409>();
  expectTypeOf(category.message).toEqualTypeOf<string>();
  expectTypeOf(invitation.code).toEqualTypeOf<InvitationCode>();
  expectTypeOf(invitation.statusCode).toEqualTypeOf<404>();
  expectTypeOf(category).toExtend<PublicErrorResponse>();
  expectTypeOf(invitation).toExtend<PublicErrorResponse>();
});

function rejectedHelperTypes() {
  // @ts-expect-error Технический ответ не задаёт бизнес-код.
  createBusinessErrorResponse(UnauthorizedError);
  const missingDefault = {
    properties: { ...ValidationError.properties, message: { type: 'string' } }
  } as const;
  // @ts-expect-error Default обязателен в metadata конкретного ответа.
  createErrorResponse(missingDefault, 400);
  const multipleCodes = {
    properties: {
      ...CategoryAlreadyExistsError.properties,
      code: { enum: ['CATEGORY_ALREADY_EXISTS', 'INVITATION_NOT_FOUND'] }
    }
  } as const;
  // @ts-expect-error Два кода не являются singleton enum.
  createBusinessErrorResponse(multipleCodes);
  const multipleStatuses = {
    properties: {
      ...CategoryAlreadyExistsError.properties,
      statusCode: { enum: [409, 404] }
    }
  } as const;
  // @ts-expect-error Два статуса не являются singleton enum.
  createBusinessErrorResponse(multipleStatuses);
  const validation = createErrorResponse(ValidationError, 400);
  // @ts-expect-error У технического ответа нет обязательного бизнес-кода.
  void validation.code;
  // @ts-expect-error Конкретный400 нельзя присвоить статусу401.
  expectTypeOf(validation.statusCode).toEqualTypeOf<401>();
  const category = createBusinessErrorResponse(CategoryAlreadyExistsError);
  // @ts-expect-error Коды разных бизнес-причин не сливаются в общий union.
  expectTypeOf(category.code).toEqualTypeOf<InvitationCode>();
  // @ts-expect-error CATEGORY_ALREADY_EXISTS сохраняет точный409.
  expectTypeOf(category.statusCode).toEqualTypeOf<404>();
}

void rejectedHelperTypes;
