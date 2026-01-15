import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import fastify from 'fastify';

import envPlugin from './plugins/env/envPlugin.ts';
import errorHandlerPlugin from './plugins/errorHandler/errorHandlerPlugin.ts';
import jwtPlugin from './plugins/jwt/jwtPlugin.ts';
import prismaPlugin from './plugins/prisma/prismaPlugin.ts';

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
  await app.register(fastifyCors, {
    origin: app.envs.FRONTEND_URL,
    credentials: true
  });
  await app.register(fastifyCookie);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  // error handler последний
  await app.register(errorHandlerPlugin);

  return app;
}

export type FastifyApp = Awaited<ReturnType<typeof appInit>>;
