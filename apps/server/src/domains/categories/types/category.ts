import type { FromSchema } from 'json-schema-to-ts';

import type CategorySchema from '#s/Category.js';
import type CategoryCreateSchema from '#s/CategoryCreate.js';
import type CategoryUpdateSchema from '#s/CategoryUpdate.js';
import type CategoryIdSchema from '#s/idObj.js';

import type { categoryListQuerySchema } from '../schemas/category-list-query.js';

export type Category = FromSchema<typeof CategorySchema>;
export type CategoryCreateBody = FromSchema<typeof CategoryCreateSchema>;
export type CategoryUpdateBody = FromSchema<typeof CategoryUpdateSchema>;
export type CategoryParams = FromSchema<typeof CategoryIdSchema>;
export type CategoryListQuery = FromSchema<typeof categoryListQuerySchema>;
export type CategoryScope = Pick<Category, 'id' | 'accountId'>;
export type CategoryFilter = Pick<Category, 'accountId'> & {
  type?: Category['type'] | undefined;
};

export type StoredCategory = Pick<Category, 'id' | 'accountId' | 'name'> & {
  type: string;
  iconKey: string | null;
};

export type CategoryCreateData = Pick<
  Category,
  'accountId' | 'type' | 'name' | 'iconKey'
> & { nameNormalized: string };

export type CategoryUpdateData = CategoryUpdateBody & {
  nameNormalized?: string;
};
