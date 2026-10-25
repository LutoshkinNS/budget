import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, it } from 'vitest';

import appInit from '#src/app-init.js';

import authRoutes from '../routes.js';

const require = createRequire(import.meta.url);
const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const directory = mkdtempSync(join(tmpdir(), 'budget-auth-account-context-'));
const databaseUrl = 'file:' + join(directory, 'test.db').split('\\').join('/');
Object.assign(process.env, {
  DATABASE_URL: databaseUrl,
  PORT: '3000',
  JWT_SECRET: 'auth-account-context-test-secret',
  FRONTEND_URL: 'http://127.0.0.1:3001',
  NODE_ENV: 'test',
  TELEGRAM_BOT_TOKEN: 'auth-account-context-test-token'
});
const app = await appInit();

function readCookie(response: { headers: Record<string, unknown> }, name: string) {
  const setCookie: unknown = response.headers['set-cookie'];
  // Тип ответа зависит от числа cookie, поэтому нормализуем его перед поиском.
  const entries = Array.isArray(setCookie)
    ? setCookie
    : setCookie === undefined
      ? []
      : [setCookie];
  const match = entries.find((value) => String(value).startsWith(name + '='));
  assert.ok(match, `cookie ${name} expected`);
  return String(match).split(';')[0];
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payloadPart = token.split('.')[1];
  assert.ok(payloadPart, 'jwt payload expected');
  return JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
}

function signLegacyJwt(payload: Record<string, unknown>) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode(payload);
  const signature = createHmac('sha256', process.env.JWT_SECRET ?? '')
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

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
    { env: process.env, stdio: 'pipe' }
  );
  await app.prisma.user.create({
    data: { id: 1n, ownedAccounts: { create: { name: 'Личный' } } }
  });
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await app.prisma.$disconnect();
  // Удаляется только каталог, созданный этим тестом внутри системного temp.
  if (directory.startsWith(join(tmpdir(), 'budget-auth-account-context-'))) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('auth account context', () => {
  it('issues tokens that carry only the user, not the account', async () => {
    const login = await app.inject({ method: 'GET', url: '/api/v1/auth/dev-login' });
    assert.equal(login.statusCode, 200, login.body);

    const accessTokenCookie = readCookie(login, 'accessToken');
    const payload = decodeJwtPayload(accessTokenCookie.split('=')[1]);
    assert.equal(payload.userId, 1);
    assert.equal('accountId' in payload, false);

    const refreshTokenCookie = readCookie(login, 'refreshToken');
    const refresh = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: { cookie: refreshTokenCookie }
    });
    assert.equal(refresh.statusCode, 200, refresh.body);
  });

  it('returns user info without a baked-in current account', async () => {
    const login = await app.inject({ method: 'GET', url: '/api/v1/auth/dev-login' });
    const me = await app.inject({
      url: '/api/v1/auth/me',
      headers: { cookie: readCookie(login, 'accessToken') }
    });
    assert.equal(me.statusCode, 200, me.body);
    const body = me.json<{
      userId: number;
      currentAccountId?: unknown;
      accounts: Array<{ id: number; name: string; isOwner: boolean }>;
    }>();
    assert.equal(body.userId, 1);
    assert.equal('currentAccountId' in body, false);
    assert.equal(body.accounts.length, 1);
    assert.equal(body.accounts[0].isOwner, true);
  });

  it('accepts a legacy token with accountId; refresh reissues it without the account', async () => {
    const account = await app.prisma.account.findFirstOrThrow({
      where: { ownerId: 1n }
    });
    const iat = Math.floor(Date.now() / 1000);
    const legacyAccess = signLegacyJwt({
      userId: 1,
      accountId: account.id,
      iat
    });
    const legacyRefresh = signLegacyJwt({
      userId: 1,
      accountId: account.id,
      type: 'refresh',
      iat
    });

    const me = await app.inject({
      url: '/api/v1/auth/me',
      headers: { cookie: 'accessToken=' + legacyAccess }
    });
    assert.equal(me.statusCode, 200, me.body);
    assert.equal(me.json<{ userId: number }>().userId, 1);

    const refreshed = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      headers: { cookie: 'refreshToken=' + legacyRefresh }
    });
    assert.equal(refreshed.statusCode, 200, refreshed.body);
    const newPayload = decodeJwtPayload(
      readCookie(refreshed, 'accessToken').split('=')[1]
    );
    assert.equal(newPayload.userId, 1);
    assert.equal('accountId' in newPayload, false);
  });

  it('signs in a user without accounts; me returns an empty list', async () => {
    // Отсутствие счёта не должно блокировать вход по приглашению.
    await app.prisma.account.deleteMany({ where: { ownerId: 1n } });

    const login = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/dev-login'
    });
    assert.equal(login.statusCode, 200, login.body);
    const payload = decodeJwtPayload(
      readCookie(login, 'accessToken').split('=')[1]
    );
    assert.equal(payload.userId, 1);
    assert.equal('accountId' in payload, false);

    const me = await app.inject({
      url: '/api/v1/auth/me',
      headers: { cookie: readCookie(login, 'accessToken') }
    });
    assert.equal(me.statusCode, 200, me.body);
    assert.deepEqual(me.json<{ accounts: unknown[] }>().accounts, []);
  });
});
