import Category from '#s/Category.js';
import CategoryCreate from '#s/CategoryCreate.js';
import idObj from '#s/idObj.js';
import { FastifyApp } from '#src/appInit.js';

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
        response: { 200: Category }
      }
    },
    async function (req) {
      const accountId = req.user.accountId;

      return await this.prisma.category.create({
        data: {
          name: req.body.name,
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

      return reply.code(204).send();
    }
  );
}
