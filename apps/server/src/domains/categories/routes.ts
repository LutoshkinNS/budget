import CategorySchema from '#s/Category.js';
import CategoryCreate from '#s/CategoryCreate.js';
import CategoryUpdate from '#s/CategoryUpdate.js';
import ConflictError from '#s/ConflictError.js';
import idObj from '#s/idObj.js';
import NotFoundError from '#s/NotFoundError.js';
import ValidationError from '#s/ValidationError.js';
import type { FastifyApp } from '#src/appInit.js';

import { createCategoryHandler } from './handlers/create.handler.js';
import { deleteCategoryHandler } from './handlers/delete.handler.js';
import { getCategoryHandler } from './handlers/get.handler.js';
import { listCategoriesHandler } from './handlers/list.handler.js';
import { updateCategoryHandler } from './handlers/update.handler.js';
import { validateIconKey } from './handlers/validate-icon-key.hook.js';
import { categoryListQuerySchema } from './schemas/category-list-query.js';
import type {
  CategoryCreateBody,
  CategoryListQuery,
  CategoryParams,
  CategoryUpdateBody
} from './types/category.js';

export default async function categoriesRoutes(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get<{ Querystring: CategoryListQuery }>(
    '/',
    {
      schema: {
        querystring: categoryListQuerySchema,
        response: { 200: { type: 'array', items: CategorySchema } }
      }
    },
    listCategoriesHandler
  );

  app.get<{ Params: CategoryParams }>(
    '/:id',
    { schema: { params: idObj, response: { 200: CategorySchema } } },
    getCategoryHandler
  );

  app.post<{ Body: CategoryCreateBody }>(
    '/',
    {
      preValidation: validateIconKey,
      schema: {
        body: CategoryCreate,
        response: {
          200: CategorySchema,
          400: ValidationError,
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
        params: idObj,
        body: CategoryUpdate,
        response: {
          200: CategorySchema,
          400: ValidationError,
          404: NotFoundError,
          409: ConflictError
        }
      }
    },
    updateCategoryHandler
  );

  app.delete<{ Params: CategoryParams }>(
    '/:id',
    { schema: { params: idObj, response: { 204: { type: 'null' } } } },
    deleteCategoryHandler
  );
}
