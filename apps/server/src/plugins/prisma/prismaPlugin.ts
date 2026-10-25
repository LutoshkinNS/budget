import fp from 'fastify-plugin';

import { PrismaClient } from '#generated/prisma/index.js';
import type { FastifyApp } from '#src/app-init.js';

async function prismaPlugin(app: FastifyApp) {
  const prisma = new PrismaClient();
  app.decorate('prisma', prisma);
}

export default fp(prismaPlugin);
