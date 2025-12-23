import fp from 'fastify-plugin';

import { PrismaClient } from '#generated/prisma/index.js';
import type { FastifyApp } from '#src/appInit.ts';

async function prismaPlugin(app: FastifyApp) {
  const prisma = new PrismaClient();
  app.decorate('prisma', prisma);
}

export default fp(prismaPlugin);
