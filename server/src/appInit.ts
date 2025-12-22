import type {JsonSchemaToTsProvider} from "@fastify/type-provider-json-schema-to-ts";
import fastify from "fastify";
import prismaPlugin from "./plugins/prisma/prismaPlugin.ts";
import jwtPlugin from "./plugins/jwt/jwtPlugin.ts";
import envPlugin from "./plugins/env/envPlugin.ts";
import fastifyCookie from "@fastify/cookie";

export default async function appInit() {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        discriminator: true
      }
    }
  }).withTypeProvider<JsonSchemaToTsProvider>();

  await app.register(envPlugin);
  await app.register(fastifyCookie);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  return app;
}

export type FastifyApp = Awaited<ReturnType<typeof appInit>>
