import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import fastify from 'fastify';

import accountAccessPlugin from './plugins/account-access/account-access.plugin.js';
import apiObservationPlugin from './plugins/api-observation/api-observation.js';
import type { ApiObservationOptions } from './plugins/api-observation/types.js';
import envPlugin from './plugins/env/envPlugin.js';
import errorHandlerPlugin from './plugins/error-handler/error-handler-plugin.js';
import jwtPlugin from './plugins/jwt/jwt-plugin.js';
import prismaPlugin from './plugins/prisma/prismaPlugin.js';

export default async function appInit(options?: ApiObservationOptions) {
  const app = fastify({
    logger: {
      serializers: {
        req: (request: { id?: string; method: string }) => ({
          method: request.method,
          requestId: request.id
        })
      }
    },
    ajv: {
      customOptions: {
        discriminator: true
      }
    }
  }).withTypeProvider<JsonSchemaToTsProvider>();

  await app.register(apiObservationPlugin, options ?? {});
  await app.register(envPlugin);
  await app.register(fastifyCors, {
    origin: app.envs.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });
  await app.register(fastifyCookie);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);
  await app.register(accountAccessPlugin);

  await app.register(errorHandlerPlugin);

  return app;
}

export type FastifyApp = Awaited<ReturnType<typeof appInit>>;
