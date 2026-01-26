import fastifyEnv from '@fastify/env';
import fp from 'fastify-plugin';
import { FromSchema } from 'json-schema-to-ts';

import { FastifyApp } from '#src/appInit.js';

const schema = {
  type: 'object',
  required: [
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'NODE_ENV',
    'TELEGRAM_BOT_TOKEN'
  ],
  properties: {
    PORT: {
      type: 'string',
      default: 3000
    },
    DATABASE_URL: {
      type: 'string'
    },
    JWT_SECRET: {
      type: 'string'
    },
    FRONTEND_URL: {
      type: 'string'
    },
    NODE_ENV: {
      type: 'string'
    },
    TELEGRAM_BOT_TOKEN: {
      type: 'string'
    }
  }
} as const;

const options = {
  confKey: 'envs',
  schema: schema
};

export type Envs = FromSchema<typeof schema>;

async function envPlugin(app: FastifyApp) {
  await app.register(fastifyEnv, options);
}

export default fp(envPlugin);
