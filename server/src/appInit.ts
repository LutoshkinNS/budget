import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastify from "fastify";
import prismaPlugin from "./plugins/prisma/prismaPlugin.ts";

export default async function appInit(){
    const app = fastify({
        logger: true,
        ajv: {
            customOptions: {
                discriminator: true
            }
        }
    }).withTypeProvider<JsonSchemaToTsProvider>();

    await app.register(prismaPlugin);

    return app;
}

export type FastifyApp = Awaited<ReturnType<typeof appInit>>