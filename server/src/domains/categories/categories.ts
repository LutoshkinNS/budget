import {FastifyApp} from "#src/appInit.js";
import Category from "#s/Category.js";
import idObj from "#s/idObj.js";
import CategoryCreate from "#s/CategoryCreate.js";

export default async function categoriesModule(app: FastifyApp){
    app.get('/', {
        schema: {
            response: {200: {type: 'array', items: Category}}
        }
    }, function () {
        return this.prisma.category.findMany();
    })

    app.get('/:id', {
        schema: {
            params: idObj,
            response: {200: Category}
        }
    }, function (req) {
        return this.prisma.category.findUniqueOrThrow({
            where: { id: req.params.id },
        });
    })

    app.post('/', {
        schema: {
            body: CategoryCreate,
            response: {200: Category}
        }
    }, async function (req)  {
        const result = await this.prisma.category.create({
            data: {
                name: req.body.name,
                userId: 1
            }
        })
        return result;
    })
}