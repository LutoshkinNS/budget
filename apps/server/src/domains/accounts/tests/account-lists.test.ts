import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, it } from 'vitest';

import appInit from '#src/app-init.js';

import accountsRoutes from '../routes.js';

type AccountResponse = {
  id: number;
  name: string;
  initialBalance: number;
  ownerId: number;
  createdAt: string;
};

type AccountMemberResponse = {
  userId: number;
  firstName: string | null;
  photoUrl: string | null;
};

const require = createRequire(import.meta.url);
const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const temporaryRoot = resolve(tmpdir());
const directory = mkdtempSync(join(temporaryRoot, 'budget-account-lists-'));
const environmentKeys = [
  'DATABASE_URL',
  'PORT',
  'JWT_SECRET',
  'FRONTEND_URL',
  'NODE_ENV',
  'TELEGRAM_BOT_TOKEN'
] as const;
const savedEnvironment = environmentKeys.map((key) => ({
  key,
  value: process.env[key]
}));

Object.assign(process.env, {
  DATABASE_URL: 'file:' + join(directory, 'test.db').split('\\').join('/'),
  PORT: '3000',
  JWT_SECRET: 'account-lists-isolated-test-secret',
  FRONTEND_URL: 'http://127.0.0.1:3001',
  NODE_ENV: 'test',
  TELEGRAM_BOT_TOKEN: 'account-lists-test-token'
});

const app = await appInit();

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
      cwd: serverRoot,
      // Prisma 6.19.2 теряет диагностическую строку новой SQLite при RUST_LOG=warn.
      env: { ...process.env, RUST_LOG: 'info' },
      stdio: 'pipe'
    }
  );
  await app.register(accountsRoutes, { prefix: '/api/v1/accounts' });
  app.get<{ Params: { userId: string } }>(
    '/test-token/:userId',
    async (request, reply) =>
      reply.accessJwtSign({ userId: Number(request.params.userId) })
  );
  await app.ready();
});

afterAll(async () => {
  try {
    await app.close();
  } finally {
    try {
      await app.prisma.$disconnect();
    } finally {
      for (const { key, value } of savedEnvironment) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      const cleanupDirectory = resolve(directory);
      assert.equal(dirname(cleanupDirectory), temporaryRoot);
      assert.ok(basename(cleanupDirectory).startsWith('budget-account-lists-'));
      rmSync(cleanupDirectory, { recursive: true, force: true });
    }
  }
});

async function cookieFor(userId: number) {
  const response = await app.inject(`/test-token/${userId}`);
  assert.equal(response.statusCode, 200, response.body);
  return 'accessToken=' + response.body;
}

describe('account and member lists', () => {
  it('returns each accessible account once when ownership and membership overlap', async () => {
    await app.prisma.user.createMany({ data: [{ id: 101n }, { id: 102n }] });
    const ownedFirst = await app.prisma.account.create({
      data: {
        name: 'Первый личный счёт',
        ownerId: 101n,
        initialBalance: 150.75,
        createdAt: new Date('2026-10-01T10:00:00.000Z')
      }
    });
    const ownedSecond = await app.prisma.account.create({
      data: {
        name: 'Второй личный счёт',
        ownerId: 101n,
        initialBalance: -20.5,
        createdAt: new Date('2026-10-02T11:00:00.000Z')
      }
    });
    const shared = await app.prisma.account.create({
      data: {
        name: 'Общий счёт',
        ownerId: 102n,
        initialBalance: 350.25,
        createdAt: new Date('2026-10-03T12:00:00.000Z')
      }
    });
    await app.prisma.account.create({
      data: {
        name: 'Недоступный счёт',
        ownerId: 102n,
        initialBalance: 999,
        createdAt: new Date('2026-10-04T13:00:00.000Z')
      }
    });
    await app.prisma.accountUser.create({
      data: { userId: 101n, accountId: shared.id }
    });
    const cookie = await cookieFor(101);
    const expectedAccounts = [
      {
        id: ownedFirst.id,
        name: 'Первый личный счёт',
        initialBalance: 150.75,
        ownerId: 101,
        createdAt: '2026-10-01T10:00:00.000Z'
      },
      {
        id: ownedSecond.id,
        name: 'Второй личный счёт',
        initialBalance: -20.5,
        ownerId: 101,
        createdAt: '2026-10-02T11:00:00.000Z'
      },
      {
        id: shared.id,
        name: 'Общий счёт',
        initialBalance: 350.25,
        ownerId: 102,
        createdAt: '2026-10-03T12:00:00.000Z'
      }
    ];

    for (const withOwnerMembership of [false, true]) {
      if (withOwnerMembership) {
        await app.prisma.accountUser.create({
          data: { userId: 101n, accountId: ownedFirst.id }
        });
      }
      const response = await app.inject({
        url: '/api/v1/accounts',
        headers: { cookie }
      });
      assert.equal(response.statusCode, 200, response.body);
      const accounts = response.json<AccountResponse[]>();
      assert.deepEqual(
        [...accounts].sort((left, right) => left.id - right.id),
        [...expectedAccounts].sort((left, right) => left.id - right.id)
      );
      assert.deepEqual(
        accounts.map((account) => account.ownerId),
        [101, 101, 102]
      );
    }
  });

  it('returns an empty account list for a user without account relations', async () => {
    await app.prisma.user.create({ data: { id: 201n } });
    const response = await app.inject({
      url: '/api/v1/accounts',
      headers: { cookie: await cookieFor(201) }
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json(), []);
  });

  it('returns each member once to the owner and a regular member', async () => {
    await app.prisma.user.createMany({
      data: [
        { id: 301n, firstName: 'Владелец', photoUrl: null },
        {
          id: 302n,
          firstName: null,
          photoUrl: 'https://example.test/member.png'
        }
      ]
    });
    const account = await app.prisma.account.create({
      data: { name: 'Счёт с участником', ownerId: 301n }
    });
    await app.prisma.accountUser.create({
      data: { userId: 302n, accountId: account.id }
    });
    const cookies = await Promise.all([cookieFor(301), cookieFor(302)]);
    const expectedMembers = [
      { userId: 301, firstName: 'Владелец', photoUrl: null },
      {
        userId: 302,
        firstName: null,
        photoUrl: 'https://example.test/member.png'
      }
    ];

    for (const withOwnerMembership of [false, true]) {
      if (withOwnerMembership) {
        await app.prisma.accountUser.create({
          data: { userId: 301n, accountId: account.id }
        });
      }
      const responses = await Promise.all(
        cookies.map((cookie) =>
          app.inject({
            url: `/api/v1/accounts/${account.id}/members`,
            headers: { cookie }
          })
        )
      );
      assert.deepEqual(
        responses.map((response) => response.statusCode),
        [200, 200]
      );
      assert.deepEqual(
        responses.map((response) => response.json<AccountMemberResponse[]>()),
        [expectedMembers, expectedMembers]
      );
    }
  });

  it('preserves owner access and forbidden responses for inaccessible accounts', async () => {
    await app.prisma.user.createMany({
      data: [
        { id: 401n, firstName: 'Личный владелец', photoUrl: null },
        { id: 402n }
      ]
    });
    const account = await app.prisma.account.create({
      data: { name: 'Только владелец', ownerId: 401n }
    });
    const ownerCookie = await cookieFor(401);
    const ownerResponse = await app.inject({
      url: `/api/v1/accounts/${account.id}/members`,
      headers: { cookie: ownerCookie }
    });
    assert.equal(ownerResponse.statusCode, 200, ownerResponse.body);
    assert.deepEqual(ownerResponse.json(), [
      { userId: 401, firstName: 'Личный владелец', photoUrl: null }
    ]);

    const forbiddenResponses = await Promise.all([
      app.inject({
        url: `/api/v1/accounts/${account.id}/members`,
        headers: { cookie: await cookieFor(402) }
      }),
      app.inject({
        url: '/api/v1/accounts/2147483647/members',
        headers: { cookie: ownerCookie }
      })
    ]);
    const expectedForbidden = {
      code: 'FORBIDDEN',
      message: 'Доступ к участникам этого аккаунта запрещён',
      statusCode: 403
    };
    assert.deepEqual(
      forbiddenResponses.map((response) => response.statusCode),
      [403, 403]
    );
    assert.deepEqual(
      forbiddenResponses.map((response) => response.json()),
      [expectedForbidden, expectedForbidden]
    );
  });
});
