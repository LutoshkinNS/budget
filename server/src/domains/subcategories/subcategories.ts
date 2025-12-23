import idObj from '#s/idObj.js';
import Subcategory from '#s/Subcategory.js';
import SubcategoryCreate from '#s/SubcategoryCreate.js';
import { FastifyApp } from '#src/appInit.js';

export default async function subcategoriesModule(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/',
    {
      schema: {
        response: { 200: { type: 'array', items: Subcategory } }
      }
    },
    function (req) {
      return this.prisma.subcategory.findMany({
        where: {
          deletedAt: null,
          category: {
            accountId: req.user.accountId
          }
        }
      });
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 200: Subcategory }
      }
    },
    function (req) {
      return this.prisma.subcategory.findFirstOrThrow({
        where: {
          id: req.params.id,
          deletedAt: null,
          category: {
            accountId: req.user.accountId
          }
        }
      });
    }
  );

  app.post(
    '/',
    {
      schema: {
        body: SubcategoryCreate,
        response: { 200: Subcategory }
      }
    },
    async function (req, reply) {
      // Проверяем что category принадлежит пользователю
      const category = await this.prisma.category.findFirst({
        where: {
          id: req.body.categoryId,
          accountId: req.user.accountId,
          deletedAt: null
        }
      });

      if (!category) {
        return (reply as any).code(404).send({
          code: 'NOT_FOUND',
          message: 'Category not found or access denied'
        });
      }

      return await this.prisma.subcategory.create({
        data: {
          name: req.body.name,
          categoryId: req.body.categoryId
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
      await this.prisma.subcategory.updateMany({
        where: {
          id: req.params.id,
          deletedAt: null,
          category: {
            accountId: req.user.accountId
          }
        },
        data: {
          deletedAt: new Date()
        }
      });

      return reply.code(204).send();
    }
  );
}
