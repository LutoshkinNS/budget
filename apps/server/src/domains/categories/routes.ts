import CategorySchema from '#s/Category.js';
import CategoryCreate from '#s/CategoryCreate.js';
import CategoryUpdate from '#s/CategoryUpdate.js';
import ConflictError from '#s/ConflictError.js';
import ForbiddenError from '#s/ForbiddenError.js';
import NotFoundError from '#s/NotFoundError.js';
import ValidationError from '#s/ValidationError.js';
import type { FastifyApp } from '#src/app-init.js';

import { createCategoryHandler } from './handlers/create.handler.js';
import { deleteCategoryHandler } from './handlers/delete.handler.js';
import { getCategoryHandler } from './handlers/get.handler.js';
import { listCategoriesHandler } from './handlers/list.handler.js';
import { updateCategoryHandler } from './handlers/update.handler.js';
import { validateIconKey } from './handlers/validate-icon-key.hook.js';
import { categoryListQuerySchema } from './schemas/category-list-query.js';
import {
  accountParamsSchema,
  categoryParamsSchema
} from './schemas/category-params.js';
import type {
  AccountParams,
  CategoryCreateBody,
  CategoryListQuery,
  CategoryParams,
  CategoryUpdateBody
} from './types/category.js';

export default async function categoriesRoutes(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireAccountAccess);

  app.get<{ Querystring: CategoryListQuery; Params: AccountParams }>(
    '/',
    {
      schema: {
        params: accountParamsSchema,
        querystring: categoryListQuerySchema,
        response: {
          200: { type: 'array', items: CategorySchema },
          403: ForbiddenError
        }
      }
    },
    listCategoriesHandler
  );

  app.get<{ Params: CategoryParams }>(
    '/:id',
    {
      schema: {
        params: categoryParamsSchema,
        response: { 200: CategorySchema, 403: ForbiddenError }
      }
    },
    getCategoryHandler
  );

  app.post<{ Body: CategoryCreateBody; Params: AccountParams }>(
    '/',
    {
      preValidation: validateIconKey,
      schema: {
        params: accountParamsSchema,
        body: CategoryCreate,
        response: {
          200: CategorySchema,
          400: ValidationError,
          403: ForbiddenError,
          409: ConflictError
        }
      }
    },
    createCategoryHandler
  );

  app.patch<{ Params: CategoryParams; Body: CategoryUpdateBody }>(
    '/:id',
    {
      preValidation: validateIconKey,
      schema: {
        params: categoryParamsSchema,
        body: CategoryUpdate,
        response: {
          200: CategorySchema,
          400: ValidationError,
          403: ForbiddenError,
          404: NotFoundError,
          409: ConflictError
        }
      }
    },
    updateCategoryHandler
  );

  app.delete<{ Params: CategoryParams }>(
    '/:id',
    {
      schema: {
        params: categoryParamsSchema,
        response: { 204: { type: 'null' }, 403: ForbiddenError }
      }
    },
    deleteCategoryHandler
  );
}
