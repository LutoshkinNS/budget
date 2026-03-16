import { Envs } from '#src/plugins/env/envPlugin.js';

declare module 'fastify' {
  interface FastifyInstance {
    envs: Envs;
  }
}
