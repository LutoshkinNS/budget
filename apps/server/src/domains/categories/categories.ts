import Category from '#s/Category.js';
import CategoryCreate from '#s/CategoryCreate.js';
import ConflictError from '#s/ConflictError.js';
import idObj from '#s/idObj.js';
import { FastifyApp } from '#src/appInit.js';

import { normalizeCategoryName } from './categoryName.js';

type CategoryType = 'income' | 'expense';

function serializeCategory(category: { id: number; accountId: number; type: string; name: string }) {
  return {
    id: category.id,
    accountId: category.accountId,
    type: category.type as CategoryType,
    name: category.name
  };
}

export default async function categoriesModule(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['income', 'expense'] }
          },
          additionalProperties: false
        },
        response: { 200: { type: 'array', items: Category } }
      }
    },
    async function (req) {
      const categories = await this.prisma.transactionCategory.findMany({
        where: {
          accountId: req.user.accountId,
          deletedAt: null,
          ...(req.query.type === undefined ? {} : { type: req.query.type })
        }
      });

      return categories.map(serializeCategory);
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 200: Category }
      }
    },
    async function (req) {
      const category = await this.prisma.transactionCategory.findFirstOrThrow({
        where: {
          id: req.params.id,
          accountId: req.user.accountId,
          deletedAt: null
        }
      });

      return serializeCategory(category);
    }
  );

  app.post(
    '/',
    {
      schema: {
        body: CategoryCreate,
        response: { 200: Category, 409: ConflictError }
      }
    },
    async function (req, reply) {
      const accountId = req.user.accountId;
      const name = req.body.name.trim();
      const normalizedName = normalizeCategoryName(req.body.name);

      const existingCategory = await this.prisma.transactionCategory.findFirst({
        where: {
          accountId,
          deletedAt: null,
          type: req.body.type,
          nameNormalized: normalizedName
        }
      });

      if (existingCategory) {
        return reply.code(409).send({
          code: 'CATEGORY_ALREADY_EXISTS',
          message: 'Category already exists',
          statusCode: 409
        });
      }

      const category = await this.prisma.transactionCategory.create({
        data: {
          name,
          nameNormalized: normalizedName,
          type: req.body.type,
          accountId
        }
      });

      return serializeCategory(category);
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 204: { type: 'null' } }
      }
    },
    async function (req, reply) {
      await this.prisma.transactionCategory.updateMany({
        where: {
          id: req.params.id,
          accountId: req.user.accountId,
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      });

      return reply.code(204).send(null);
    }
  );
}
