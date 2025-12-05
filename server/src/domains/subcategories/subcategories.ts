import {FastifyApp} from "#src/appInit.js";
import Subcategory from "#s/Subcategory.js";
import idObj from "#s/idObj.js";
import SubcategoryCreate from "#s/SubcategoryCreate.js";

export default async function subcategoriesModule(app: FastifyApp) {
  app.get('/', {
    schema: {
      response: {200: {type: 'array', items: Subcategory}}
    }
  }, function () {
    return this.prisma.subcategory.findMany({
      where: {deletedAt: null}
    });
  })

  app.get('/:id', {
    schema: {
      params: idObj,
      response: {200: Subcategory}
    }
  }, function (req) {
    return this.prisma.subcategory.findUniqueOrThrow({
      where: {
        id: req.params.id,
        deletedAt: null
      },
    });
  })

  app.post('/', {
    schema: {
      body: SubcategoryCreate,
      response: {200: Subcategory}
    }
  }, async function (req) {
    return await this.prisma.subcategory.create({
      data: {
        name: req.body.name,
        categoryId: req.body.categoryId
      }
    });
  })

  app.delete('/:id', {
    schema: {
      params: idObj,
      response: {204: {type: 'null'}}
    }
  }, async function (req, reply) {
    await this.prisma.subcategory.update({
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
