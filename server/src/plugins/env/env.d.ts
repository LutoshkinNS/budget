import {Envs} from "#src/plugins/env/envPlugin.ts";

declare module 'fastify'{
  interface FastifyInstance{
    envs: Envs
  }
}
