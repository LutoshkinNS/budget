import CategorySchema from '#s/Category.js';

export const categoryListQuerySchema = {
  type: 'object',
  properties: {
    type: CategorySchema.properties.type,
    sort: { type: 'string', enum: ['usage'] }
  },
  additionalProperties: false
} as const;
