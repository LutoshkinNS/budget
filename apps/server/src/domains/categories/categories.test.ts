import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, it } from 'vitest';

import appInit from '#src/appInit.js';

import categoriesModule from './categories.js';

const require = createRequire(import.meta.url);
const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const directory = mkdtempSync(join(tmpdir(), 'budget-category-icons-'));
const databaseUrl = 'file:' + join(directory, 'test.db').split('\\').join('/');
Object.assign(process.env, {
  DATABASE_URL: databaseUrl,
  PORT: '3000',
  JWT_SECRET: 'category-icons-isolated-test-secret',
  FRONTEND_URL: 'http://127.0.0.1:3001',
  NODE_ENV: 'test',
  TELEGRAM_BOT_TOKEN: 'category-icons-test-token'
});
const app = await appInit();
let accountId = 0;
let cookie = '';

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
  await app.prisma.user.create({ data: { id: 1n } });
  const account = await app.prisma.account.create({
    data: { name: 'Тест', ownerId: 1n }
  });
  accountId = account.id;
  await app.register(categoriesModule, { prefix: '/api/v1/categories' });
  app.get('/test-token', async (_request, reply) =>
    reply.accessJwtSign({ userId: 1, accountId })
  );
  await app.ready();
  cookie = 'accessToken=' + (await app.inject('/test-token')).body;
});

afterAll(async () => {
  await app.close();
  await app.prisma.$disconnect();
  // Удаляется только каталог, созданный этим тестом внутри системного temp.
  if (directory.startsWith(join(tmpdir(), 'budget-category-icons-'))) {
    rmSync(directory, { recursive: true, force: true });
  }
});

async function createCategory(name: string, iconKey?: string | null) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/categories',
    headers: { cookie },
    payload: {
      type: 'expense',
      name,
      ...(iconKey === undefined ? {} : { iconKey })
    }
  });
  assert.equal(response.statusCode, 200, response.body);
  return response.json<{ id: number; name: string; iconKey: string | null }>();
}

describe('category icon API', () => {
  it('does not choose icons from a known name and accepts explicit null', async () => {
    const absent = await createCategory('продукты');
    const empty = await createCategory('Без иконки', null);
    assert.equal(absent.iconKey, null);
    assert.equal(empty.iconKey, null);
    const stored = await app.prisma.transactionCategory.findUniqueOrThrow({
      where: { id: absent.id }
    });
    assert.equal(stored.iconKey, null);
  });

  it('persists a chosen icon through detail/list and permits replacement and clearing', async () => {
    const category = await createCategory('Выбранная', 'groceries');
    assert.equal(category.iconKey, 'groceries');
    const detail = await app.inject({
      url: '/api/v1/categories/' + category.id,
      headers: { cookie }
    });
    assert.equal(detail.json<{ iconKey: string }>().iconKey, 'groceries');
    const list = await app.inject({
      url: '/api/v1/categories?type=expense',
      headers: { cookie }
    });
    assert.equal(
      list
        .json<Array<{ id: number; iconKey: string | null }>>()
        .find((c) => c.id === category.id)?.iconKey,
      'groceries'
    );
    for (const iconKey of ['taxi', null]) {
      const updated = await app.inject({
        method: 'PATCH',
        url: '/api/v1/categories/' + category.id,
        headers: { cookie },
        payload: { iconKey }
      });
      assert.equal(updated.statusCode, 200, updated.body);
      assert.equal(
        updated.json<{ iconKey: string | null; name: string }>().iconKey,
        iconKey
      );
      assert.equal(updated.json<{ name: string }>().name, category.name);
      const stored = await app.prisma.transactionCategory.findUniqueOrThrow({
        where: { id: category.id }
      });
      assert.equal(stored.iconKey, iconKey);
    }
  });

  it('validates icon values and does not clear an icon for a missing body field', async () => {
    const category = await createCategory('Валидация', 'car');
    for (const payload of [
      {},
      { iconKey: 'unknown' },
      { iconKey: 1 },
      { iconKey: '' }
    ]) {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/categories/' + category.id,
        headers: { cookie },
        payload
      });
      assert.equal(response.statusCode, 400, response.body);
    }
    const invalidCreate = await app.inject({
      method: 'POST',
      url: '/api/v1/categories',
      headers: { cookie },
      payload: { type: 'expense', name: 'Ошибка', iconKey: 'unknown' }
    });
    assert.equal(invalidCreate.statusCode, 400, invalidCreate.body);
    assert.equal(
      (
        await app.prisma.transactionCategory.findUniqueOrThrow({
          where: { id: category.id }
        })
      ).iconKey,
      'car'
    );
  });

  it('supports all twenty keys for income and expense without auto-assignment', async () => {
    const keys = [
      'groceries',
      'meals',
      'clothes',
      'sport',
      'car',
      'home',
      'leisure',
      'mobile',
      'internet',
      'gifts',
      'public-transport',
      'pets',
      'subscriptions',
      'games',
      'education',
      'travel',
      'taxi',
      'apartment',
      'health',
      'beauty'
    ];
    for (const type of ['income', 'expense']) {
      for (const iconKey of keys) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/categories',
          headers: { cookie },
          payload: { type, name: type + '-' + iconKey, iconKey }
        });
        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json<{ iconKey: string }>().iconKey, iconKey);
      }
    }
  });

  it('protects missing, deleted and other-account categories', async () => {
    const deleted = await createCategory('Удалённая', 'health');
    await app.prisma.transactionCategory.update({
      where: { id: deleted.id },
      data: { deletedAt: new Date() }
    });
    const otherAccount = await app.prisma.account.create({
      data: { ownerId: 1n, name: 'Чужой' }
    });
    const foreign = await app.prisma.transactionCategory.create({
      data: {
        accountId: otherAccount.id,
        type: 'expense',
        name: 'Чужая',
        nameNormalized: 'чужая',
        iconKey: 'pets'
      }
    });
    for (const id of [deleted.id, foreign.id, 999999]) {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/categories/' + id,
        headers: { cookie },
        payload: { iconKey: 'taxi' }
      });
      assert.equal(response.statusCode, 404, response.body);
    }
    assert.equal(
      (
        await app.prisma.transactionCategory.findUniqueOrThrow({
          where: { id: deleted.id }
        })
      ).iconKey,
      'health'
    );
    assert.equal(
      (
        await app.prisma.transactionCategory.findUniqueOrThrow({
          where: { id: foreign.id }
        })
      ).iconKey,
      'pets'
    );
    const unauthenticated = await app.inject({
      method: 'PATCH',
      url: '/api/v1/categories/' + foreign.id,
      payload: { iconKey: 'taxi' }
    });
    assert.equal(unauthenticated.statusCode, 401);
  });
});
