import {FastifyApp} from "#src/appInit.js";
import Category from "#s/Category.js";
import idObj from "#s/idObj.js";
import CategoryCreate from "#s/CategoryCreate.js";

export default async function categoriesModule(app: FastifyApp) {
  app.get('/', {
    schema: {
      response: {200: {type: 'array', items: Category}}
    }
  }, function () {
    return this.prisma.category.findMany({
      where: {deletedAt: null}
    });
  })

  app.get('/:id', {
    schema: {
      params: idObj,
      response: {200: Category}
    }
  }, function (req) {
    return this.prisma.category.findUniqueOrThrow({
      where: {
        id: req.params.id,
        deletedAt: null
      },
    });
  })

  app.post('/', {
    schema: {
      body: CategoryCreate,
      response: {200: Category}
    }
  }, async function (req) {
    // TODO: Исправить после добавления авторизации
    const accountId = 1;

    return await this.prisma.category.create({
      data: {
        name: req.body.name,
        accountId
      }
    });
  })

  app.delete('/:id', {
    schema: {
      params: idObj,
      response: {204: {type: 'null'}}
    }
  }, async function (req, reply) {
    await this.prisma.category.update({
      where: {
        id: req.params.id,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    })

    return reply.code(204).send()
  })
}
