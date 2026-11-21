import { execFileSync } from 'node:child_process';
import { createHash, createHmac } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import appInit from '#src/app-init.js';
import accountsRoutes from '#src/domains/accounts/routes.js';
import authRoutes from '#src/domains/auth/routes.js';
import categoriesRoutes from '#src/domains/categories/routes.js';
import subcategoriesRoutes from '#src/domains/subcategories/subcategories.js';
import transactionsRoutes from '#src/domains/transactions/transactions.js';

const require = createRequire(import.meta.url);
const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const temporaryRoot = resolve(tmpdir());
const directory = mkdtempSync(join(temporaryRoot, 'budget-native-errors-'));
const NATIVE_HEADER = 'x-native-status';
const SIGN_FAILURE_HEADER = 'x-jwt-sign-failure';
const SIGN_FAILURE_SECRET = 'private-native-signing-secret';
const BOT_TOKEN = 'native-error-test-token';
const BUSINESS = {
  category: 'CATEGORY_ALREADY_EXISTS',
  invitation: 'INVITATION_NOT_FOUND'
} as const;
const ID = { owner: 1, outsider: 2, missing: 999999 } as const;
const METHOD = {
  get: 'GET',
  post: 'POST',
  patch: 'PATCH',
  delete: 'DELETE'
} as const;
Object.assign(process.env, {
  DATABASE_URL: 'file:' + join(directory, 'test.db').split('\\').join('/'),
  PORT: '3000',
  JWT_SECRET: 'native-error-isolated-secret',
  FRONTEND_URL: 'http://127.0.0.1:3001',
  NODE_ENV: 'test',
  TELEGRAM_BOT_TOKEN: BOT_TOKEN
});
const app = await appInit();
let accountId = 0;
let ownerCookie = '';
let outsiderCookie = '';

beforeAll(async () => {
  execFileSync(
    process.execPath,
    [
      require.resolve('prisma/build/index.js'),
      'migrate',
      'deploy',
      '--schema',
      join(serverRoot, 'prisma/schema.prisma')
    ],
    {
      env: { ...process.env, RUST_LOG: 'info' },
      stdio: 'pipe',
      windowsHide: true
    }
  );
  await app.prisma.user.createMany({
    data: [{ id: BigInt(ID.owner) }, { id: BigInt(ID.outsider) }]
  });
  accountId = (
    await app.prisma.account.create({
      data: { name: 'Проверка ошибок', ownerId: BigInt(ID.owner) }
    })
  ).id;
  app.addHook('preHandler', async (request, reply) => {
    if (request.headers[SIGN_FAILURE_HEADER]) {
      Object.defineProperty(reply, 'accessJwtSign', {
        value: async () => {
          throw new Error(SIGN_FAILURE_SECRET);
        }
      });
    }
    const status = Number(request.headers[NATIVE_HEADER]);
    if (status === 404 || status === 409)
      throw Object.assign(new Error('private-native-serializer-error'), {
        statusCode: status
      });
  });
  await app.register(accountsRoutes, { prefix: '/api/v1/accounts' });
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(categoriesRoutes, {
    prefix: '/api/v1/accounts/:accountId/categories'
  });
  await app.register(subcategoriesRoutes, {
    prefix: '/api/v1/accounts/:accountId/categories/:categoryId/subcategories'
  });
  await app.register(transactionsRoutes, {
    prefix: '/api/v1/accounts/:accountId/transactions'
  });
  app.get<{ Params: { userId: string } }>(
    '/test-token/:userId',
    async (request, reply) =>
      reply.accessJwtSign({ userId: Number(request.params.userId) })
  );
  await app.ready();
  ownerCookie =
    'accessToken=' + (await app.inject(`/test-token/${ID.owner}`)).body;
  outsiderCookie =
    'accessToken=' + (await app.inject(`/test-token/${ID.outsider}`)).body;
});

afterAll(async () => {
  await app.close();
  await app.prisma.$disconnect();
  if (
    dirname(directory) === temporaryRoot &&
    directory.startsWith(join(temporaryRoot, 'budget-native-errors-'))
  )
    rmSync(directory, { recursive: true, force: true });
});

const CASES = [
  {
    name: 'account members access',
    message: 'Доступ к участникам этого аккаунта запрещён',
    method: METHOD.get,
    suffix: '/members',
    status: 403,
    outsider: true
  },
  {
    name: 'create invitation owner check',
    message: 'Только владелец аккаунта может создавать приглашения',
    method: METHOD.post,
    suffix: '/invitations',
    status: 403,
    outsider: true
  },
  {
    name: 'account update owner check',
    message: 'Только владелец аккаунта может изменять настройки аккаунта',
    method: METHOD.patch,
    suffix: '',
    status: 403,
    outsider: true,
    payload: { name: 'Недоступно' }
  },
  {
    name: 'account access plugin',
    message: 'Нет доступа к этому счёту',
    method: METHOD.get,
    suffix: '/categories',
    status: 403,
    outsider: true
  },
  {
    name: 'missing subcategory read',
    method: METHOD.get,
    suffix: `/categories/${ID.missing}/subcategories/${ID.missing}`,
    status: 404
  },
  {
    name: 'missing parent for subcategory create',
    method: METHOD.post,
    suffix: `/categories/${ID.missing}/subcategories`,
    status: 404,
    payload: { name: 'Подкатегория' }
  },
  {
    name: 'missing transaction read',
    method: METHOD.get,
    suffix: `/transactions/${ID.missing}`,
    status: 404
  },
  {
    name: 'missing transaction update',
    method: METHOD.patch,
    suffix: `/transactions/${ID.missing}`,
    status: 404,
    payload: {
      amount: 15,
      categoryId: ID.missing,
      type: 'expense',
      date: '2026-11-18T10:00:00.000Z'
    }
  },

  {
    name: 'invalid domain date interval',
    method: METHOD.get,
    suffix:
      '/transactions/summary?from=2026-11-18T00:00:00.000Z&to=2026-11-17T00:00:00.000Z',
    status: 400
  }
] as const;

describe('native direct domain response contract', () => {
  it.each(CASES)(
    'returns the complete technical DTO for $name',
    async (scenario) => {
      const response = await app.inject({
        method: scenario.method,
        url: `/api/v1/accounts/${accountId}${scenario.suffix}`,
        headers: {
          cookie:
            'outsider' in scenario && scenario.outsider
              ? outsiderCookie
              : ownerCookie
        },
        ...('payload' in scenario ? { payload: scenario.payload } : {})
      });
      expect(response.statusCode).toBe(scenario.status);
      expect(response.json()).toEqual({
        statusCode: scenario.status,
        message:
          'message' in scenario ? scenario.message : expect.stringMatching(/\S/)
      });
    }
  );

  it('retains CATEGORY_ALREADY_EXISTS409 and accepts native409 through the same real serializer', async () => {
    const url = `/api/v1/accounts/${accountId}/categories`;
    const payload = { type: 'expense', name: 'Повтор категории' };
    expect(
      (
        await app.inject({
          method: METHOD.post,
          url,
          headers: { cookie: ownerCookie },
          payload
        })
      ).statusCode
    ).toBe(200);
    const duplicate = await app.inject({
      method: METHOD.post,
      url,
      headers: { cookie: ownerCookie },
      payload
    });
    expect(duplicate.statusCode).toBe(409);
    expect(duplicate.json()).toEqual({
      statusCode: 409,
      message: expect.stringMatching(/\S/),
      code: BUSINESS.category
    });
    const native = await app.inject({
      method: METHOD.post,
      url,
      headers: { cookie: ownerCookie, [NATIVE_HEADER]: '409' },
      payload
    });
    expect(native.statusCode).toBe(409);
    expect(native.json()).toEqual({
      statusCode: 409,
      message: expect.stringMatching(/\S/)
    });
    expect(native.body).not.toContain('private-');
  });

  it('retains INVITATION_NOT_FOUND404 and accepts native404 through the same real serializer', async () => {
    const input = {
      method: METHOD.post,
      url: '/api/v1/accounts/invitations/redeem',
      headers: { cookie: ownerCookie },
      payload: { code: 'missing-code' }
    };
    const missing = await app.inject(input);
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({
      statusCode: 404,
      message: expect.stringMatching(/\S/),
      code: BUSINESS.invitation
    });
    const native = await app.inject({
      ...input,
      headers: { ...input.headers, [NATIVE_HEADER]: '404' }
    });
    expect(native.statusCode).toBe(404);
    expect(native.json()).toEqual({
      statusCode: 404,
      message: expect.stringMatching(/\S/)
    });
  });

  it('keeps already-member invitation redemption a successful idempotent response', async () => {
    const invitation = await app.prisma.accountInvitation.create({
      data: {
        code: 'owner-already-member',
        accountId,
        createdBy: BigInt(ID.owner),
        expiresAt: new Date('2030-01-01T00:00:00.000Z')
      }
    });
    const response = await app.inject({
      method: METHOD.post,
      url: '/api/v1/accounts/invitations/redeem',
      headers: { cookie: ownerCookie },
      payload: { code: invitation.code }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: invitation.id,
      code: invitation.code,
      accountId,
      expiresAt: invitation.expiresAt.toISOString()
    });
  });

  it('returns the complete401 DTO for a direct invalid Telegram login', async () => {
    const response = await app.inject({
      method: METHOD.post,
      url: '/api/v1/auth/login',
      payload: {
        id: 1,
        first_name: 'Проверка',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'invalid-telegram-hash'
      }
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      message: 'Неверные данные авторизации Telegram'
    });
  });
  it.each([
    { method: METHOD.get, path: '/api/v1/auth/me' },
    { method: METHOD.post, path: '/api/v1/auth/refresh' }
  ])(
    'normalizes a real unsigned token on $path through the production verification seam',
    async ({ method, path }) => {
      const token =
        ownerCookie
          .slice('accessToken='.length)
          .split('.')
          .slice(0, 2)
          .join('.') + '.';
      const response = await app.inject({
        method,
        url: path,
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        statusCode: 401,
        message: 'Требуется действительная авторизация.'
      });
    }
  );
  it('keeps a real refresh signing failure outside the verification401 boundary', async () => {
    const token = ownerCookie.slice('accessToken='.length);
    const response = await app.inject({
      method: METHOD.post,
      url: '/api/v1/auth/refresh',
      headers: {
        authorization: `Bearer ${token}`,
        [SIGN_FAILURE_HEADER]: 'enabled'
      }
    });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера.'
    });
    expect(response.body).not.toContain(SIGN_FAILURE_SECRET);
  });
  it('preserves an idempotent204 for deletion of an absent transaction', async () => {
    const response = await app.inject({
      method: METHOD.delete,
      url: `/api/v1/accounts/${accountId}/transactions/${ID.missing}`,
      headers: { cookie: ownerCookie }
    });
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });
  it('preserves the direct expired Telegram authentication message', async () => {
    const body = { id: 1, first_name: 'Проверка', auth_date: 1 };
    const signatureData = 'auth_date=1\nfirst_name=Проверка\nid=1';
    const secretKey = createHash('sha256').update(BOT_TOKEN).digest();
    const hash = createHmac('sha256', secretKey)
      .update(signatureData)
      .digest('hex');
    const response = await app.inject({
      method: METHOD.post,
      url: '/api/v1/auth/login',
      payload: { ...body, hash }
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      message: 'Данные авторизации истекли'
    });
  });
});
