import ForbiddenError from '#s/ForbiddenError.js';
import NotFoundError from '#s/NotFoundError.js';
import Subcategory from '#s/Subcategory.js';
import SubcategoryCreate from '#s/SubcategoryCreate.js';
import { FastifyApp } from '#src/appInit.js';

const categoryParamsSchema = {
  type: 'object',
  properties: {
    accountId: { type: 'integer', minimum: 1 },
    categoryId: { type: 'integer', minimum: 1 }
  },
  required: ['accountId', 'categoryId'],
  additionalProperties: false
} as const;

const subcategoryParamsSchema = {
  type: 'object',
  properties: {
    accountId: { type: 'integer', minimum: 1 },
    categoryId: { type: 'integer', minimum: 1 },
    id: { type: 'integer' }
  },
  required: ['accountId', 'categoryId', 'id'],
  additionalProperties: false
} as const;

const notFound = {
  code: 'NOT_FOUND' as const,
  message: 'Category not found or access denied',
  statusCode: 404 as const
};

export default async function subcategoriesModule(app: FastifyApp) {
  // Токен удостоверяет пользователя; доступ к счёту из path проверяется отдельно
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireAccountAccess);

  app.get(
    '/',
    {
      schema: {
        params: categoryParamsSchema,
        response: {
          200: { type: 'array', items: Subcategory },
          403: ForbiddenError
        }
      }
    },
    async function (req) {
      const category = await this.prisma.transactionCategory.findFirst({
        where: {
          id: req.params.categoryId,
          accountId: req.params.accountId,
          deletedAt: null
        }
      });

      if (!category) {
        return [];
      }

      return this.prisma.subcategory.findMany({
        where: {
          categoryId: req.params.categoryId,
          deletedAt: null
        }
      });
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: subcategoryParamsSchema,
        response: { 200: Subcategory, 403: ForbiddenError, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const subcategory = await this.prisma.subcategory.findFirst({
        where: {
          id: req.params.id,
          categoryId: req.params.categoryId,
          deletedAt: null,
          category: {
            accountId: req.params.accountId
          }
        }
      });

      if (!subcategory) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Subcategory not found or access denied',
          statusCode: 404
        });
      }

      return subcategory;
    }
  );

  app.post(
    '/',
    {
      schema: {
        params: categoryParamsSchema,
        body: SubcategoryCreate,
        response: {
          200: Subcategory,
          403: ForbiddenError,
          404: NotFoundError
        }
      }
    },
    async function (req, reply) {
      // Категория должна быть активной и принадлежать счёту из path
      const category = await this.prisma.transactionCategory.findFirst({
        where: {
          id: req.params.categoryId,
          accountId: req.params.accountId,
          deletedAt: null
        }
      });

      if (!category) {
        return reply.code(404).send(notFound);
      }

      return await this.prisma.subcategory.create({
        data: {
          name: req.body.name,
          categoryId: req.params.categoryId
        }
      });
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: subcategoryParamsSchema,
        response: { 204: { type: 'null' }, 403: ForbiddenError }
      }
    },
    async function (req, reply) {
      await this.prisma.subcategory.updateMany({
        where: {
          id: req.params.id,
          categoryId: req.params.categoryId,
          deletedAt: null,
          category: {
            accountId: req.params.accountId
          }
        },
        data: {
          deletedAt: new Date()
        }
      });

      return reply.code(204).send(null);
    }
  );
}
