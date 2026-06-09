import Category from '#s/Category.js';
import CategoryCreate from '#s/CategoryCreate.js';
import ConflictError from '#s/ConflictError.js';
import idObj from '#s/idObj.js';
import { FastifyApp } from '#src/appInit.js';

import { normalizeCategoryName } from './categoryName.js';

export default async function categoriesModule(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/',
    {
      schema: {
        response: { 200: { type: 'array', items: Category } }
      }
    },
    function (req) {
      return this.prisma.category.findMany({
        where: {
          accountId: req.user.accountId,
          deletedAt: null
        }
      });
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
    function (req) {
      return this.prisma.category.findFirstOrThrow({
        where: {
          id: req.params.id,
          accountId: req.user.accountId,
          deletedAt: null
        }
      });
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

      const existingCategory = await this.prisma.category.findFirst({
        where: {
          accountId,
          deletedAt: null,
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

      return await this.prisma.category.create({
        data: {
          name,
          nameNormalized: normalizedName,
          accountId
        }
      });
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
      await this.prisma.category.updateMany({
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
