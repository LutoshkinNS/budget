import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import appInit from '#src/app-init.js';
import authRoutes from '#src/domains/auth/routes.js';

import categoriesRoutes from '../routes.js';

const require = createRequire(import.meta.url);
const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const directory = mkdtempSync(join(tmpdir(), 'budget-api-error-pilot-'));
Object.assign(process.env, {
  DATABASE_URL: 'file:' + join(directory, 'test.db').split('\\').join('/'),
  PORT: '3000',
  JWT_SECRET: 'api-error-pilot-isolated-secret',
  FRONTEND_URL: 'http://127.0.0.1:3001',
  NODE_ENV: 'test',
  TELEGRAM_BOT_TOKEN: 'api-error-pilot-test-token'
});
const apps: Awaited<ReturnType<typeof appInit>>[] = [];

beforeAll(() => {
  execFileSync(
    process.execPath,
    [
      require.resolve('prisma/build/index.js'),
      'migrate',
      'deploy',
      '--schema',
      join(serverRoot, 'prisma/schema.prisma')
    ],
    { env: { ...process.env, RUST_LOG: 'info' }, stdio: 'pipe' }
  );
});

afterAll(async () => {
  for (const app of apps) {
    await app.close();
    await app.prisma.$disconnect();
  }
  if (
    dirname(directory) === resolve(tmpdir()) &&
    directory.startsWith(join(tmpdir(), 'budget-api-error-pilot-'))
  ) {
    rmSync(directory, { recursive: true, force: true });
  }
});

async function mount(observe?: (event: unknown) => void | Promise<void>) {
  const app = await appInit(observe ? { observe } : undefined);
  apps.push(app);
  await app.prisma.user.upsert({
    where: { id: 1n },
    create: { id: 1n },
    update: {}
  });
  const account = await app.prisma.account.create({
    data: { name: 'Пилот', ownerId: 1n }
  });
  await app.register(categoriesRoutes, {
    prefix: '/api/v1/accounts/:accountId/categories'
  });
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.get('/test-token', async (_request, reply) =>
    reply.accessJwtSign({ userId: 1 })
  );
  await app.ready();
  const cookie = 'accessToken=' + (await app.inject('/test-token')).body;
  return { app, cookie, url: `/api/v1/accounts/${account.id}/categories` };
}

describe('categories API error pilot', () => {
  it.each([
    { method: 'GET', url: '/api/v1/auth/me' },
    { method: 'POST', url: '/api/v1/auth/refresh' },
    { method: 'POST', url: '/api/v1/auth/logout' }
  ] as const)(
    'preserves malformed400 and missing401 on the real $method $url route',
    async ({ method, url }) => {
      const { app } = await mount();
      const malformed = await app.inject({
        method,
        url,
        headers: { authorization: 'Bearer private-malformed extra' }
      });
      expect(malformed.statusCode).toBe(400);
      expect(malformed.json()).toEqual({
        message: 'Некорректные параметры запроса.',
        statusCode: 400
      });

      const missing = await app.inject({ method, url });
      expect(missing.statusCode).toBe(401);
      expect(missing.json()).toEqual({
        message: expect.stringMatching(/\S/),
        statusCode: 401
      });
    }
  );

  it('returns a safe validation400 body from the real route and serializer', async () => {
    const { app, cookie, url } = await mount();
    const response = await app.inject({
      url: `${url}?type=pilot-invalid`,
      headers: { cookie }
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: 'Некорректные параметры запроса.',
      statusCode: 400
    });
  });

  it.each(['collector', 'noop', 'throw', 'reject'] as const)(
    'keeps success200 and validation400 intact with a %s observer',
    async (mode) => {
      const events: unknown[] = [];
      const observe = (event: unknown) => {
        events.push(event);
        if (mode === 'throw') throw new Error('Pilot sink failure');
        if (mode === 'reject')
          return Promise.reject(new Error('Pilot sink failure'));
      };
      const { app, cookie, url } = await mount(
        mode === 'noop' ? undefined : observe
      );
      events.length = 0;
      const success = await app.inject({
        url: `${url}?type=expense`,
        headers: { cookie }
      });
      const failure = await app.inject({
        url: `${url}?type=pilot-invalid`,
        headers: { cookie }
      });
      await Promise.resolve();
      expect(success.statusCode).toBe(200);
      expect(success.json()).toEqual([]);
      expect(failure.statusCode).toBe(400);
      expect(failure.json()).toEqual({
        message: 'Некорректные параметры запроса.',
        statusCode: 400
      });
      if (mode !== 'noop') {
        expect(events).toHaveLength(2);
        expect(events).toEqual([
          expect.objectContaining({
            runtime: 'server',
            event: 'http-completed',
            operation: 'categoriesList',
            method: 'GET',
            outcome: 'success',
            status: 200
          }),
          expect.objectContaining({
            runtime: 'server',
            event: 'http-completed',
            operation: 'categoriesList',
            method: 'GET',
            outcome: 'http-error',
            status: 400
          })
        ]);
      }
    }
  );
});
