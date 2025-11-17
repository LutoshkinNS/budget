import fastify from 'fastify'
import {PrismaClient} from "../generated/prisma/index.js";
import {JsonSchemaToTsProvider} from "@fastify/type-provider-json-schema-to-ts";

import Category from "#s/Category.js";
import CategoryCreate from "#s/CategoryCreate.js";
import idObj from "#s/idObj.js";

const serverOptions = {
    logger: {
        level: 'info',
    },
    ajv: {
        customOptions: {
            discriminator: true
        }
    },
};

const prisma = new PrismaClient();

const app = fastify(serverOptions).withTypeProvider<JsonSchemaToTsProvider>();

app.get('/categories', {
    schema: {
        response: {200: {type: 'array', items: Category}}
    }
}, () => {
    return prisma.category.findMany();
})

app.get('/categories/:id', {
    schema: {
        params: idObj,
        response: {200: Category}
    }
}, (req) => {
    return prisma.category.findUniqueOrThrow({
        where: { id: req.params.id },
    });
})

app.post('/categories', {
    schema: {
        body: CategoryCreate,
        response: {200: Category}
    }
}, async (req) => {
    const result = await prisma.category.create({
        data: {
            name: req.body.name,
            userId: 1
        }
    })
    return result;
})

app.listen({
    port: 3000,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

app.log.debug(
    app.initialConfig,
    'Fastify listening with the config'
);