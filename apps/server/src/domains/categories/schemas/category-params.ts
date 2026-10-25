export const accountParamsSchema = {
  type: 'object',
  properties: {
    accountId: { type: 'integer', minimum: 1 }
  },
  required: ['accountId'],
  additionalProperties: false
} as const;

export const categoryParamsSchema = {
  type: 'object',
  properties: {
    accountId: { type: 'integer', minimum: 1 },
    id: { type: 'integer' }
  },
  required: ['accountId', 'id'],
  additionalProperties: false
} as const;
