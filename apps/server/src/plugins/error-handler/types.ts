import type { FromSchema } from 'json-schema-to-ts';

import ErrorDTO from '#s/ErrorDTO.js';

import type { ERROR_HANDLER } from './constants.js';

export type PublicErrorResponse = FromSchema<typeof ErrorDTO>;

export type ErrorCategory =
  (typeof ERROR_HANDLER.category)[keyof typeof ERROR_HANDLER.category];

export type ErrorPhase =
  (typeof ERROR_HANDLER.phase)[keyof typeof ERROR_HANDLER.phase];

export type NormalizedError = {
  response: PublicErrorResponse;
  category: ErrorCategory;
  phase: ErrorPhase;
};
