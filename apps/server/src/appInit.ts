import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import fastify from 'fastify';

import envPlugin from './plugins/env/envPlugin.js';
import errorHandlerPlugin from './plugins/errorHandler/errorHandlerPlugin.js';
import jwtPlugin from './plugins/jwt/jwtPlugin.js';
import prismaPlugin from './plugins/prisma/prismaPlugin.js';

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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });
  await app.register(fastifyCookie);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  // error handler последний
  await app.register(errorHandlerPlugin);

  return app;
}

export type FastifyApp = Awaited<ReturnType<typeof appInit>>;
