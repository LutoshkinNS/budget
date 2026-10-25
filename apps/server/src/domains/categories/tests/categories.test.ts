import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, it } from 'vitest';

import appInit from '#src/app-init.js';

import categoriesRoutes from '../routes.js';

const require = createRequire(import.meta.url);
const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
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
  await app.register(categoriesRoutes, {
    prefix: '/api/v1/accounts/:accountId/categories'
  });
  app.get('/test-token', async (_request, reply) =>
    reply.accessJwtSign({ userId: 1 })
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
    url: `/api/v1/accounts/${accountId}/categories`,
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
  it('allows only one concurrent rename to the same normalized name', async () => {
    const first = await createCategory('Параллельная первая');
    const second = await createCategory('Параллельная вторая');
    const responses = await Promise.all(
      [first, second].map((category) =>
        app.inject({
          method: 'PATCH',
          url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
          headers: { cookie },
          payload: { name: 'Общее конкурентное имя' }
        })
      )
    );
    assert.deepEqual(
      responses.map((response) => response.statusCode).sort(),
      [200, 409]
    );
    assert.equal(
      await app.prisma.transactionCategory.count({
        where: {
          accountId,
          type: 'expense',
          deletedAt: null,
          nameNormalized: 'общее конкурентное имя'
        }
      }),
      1
    );
  });

  it('renames in place, preserving transactions, type and icon, and permits own case changes', async () => {
    const category = await createCategory('Исходная категория', 'car');
    const transaction = await app.prisma.transaction.create({
      data: {
        accountId,
        userId: 1n,
        categoryId: category.id,
        type: 'expense',
        amount: 10,
        date: new Date()
      }
    });
    for (const name of ['  Новое название  ', 'НОВОЕ НАЗВАНИЕ']) {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
        headers: { cookie },
        payload: { name }
      });
      assert.equal(response.statusCode, 200, response.body);
      assert.deepEqual(response.json(), {
        id: category.id,
        accountId,
        type: 'expense',
        name: name.trim(),
        iconKey: 'car'
      });
      const stored = await app.prisma.transaction.findUniqueOrThrow({
        where: { id: transaction.id },
        include: { category: true }
      });
      assert.equal(stored.categoryId, category.id);
      assert.equal(stored.category.name, name.trim());
      assert.equal(stored.category.nameNormalized, 'новое название');
      assert.equal(stored.amount, 10);
    }
  });

  it('rejects empty names and normalized duplicates without partially changing the icon', async () => {
    const category = await createCategory('До проверки', 'car');
    await createCategory('Занято');
    for (const name of ['', '   ', '\t\n']) {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
        headers: { cookie },
        payload: { name }
      });
      assert.equal(response.statusCode, 400, response.body);
    }
    const conflict = await app.inject({
      method: 'PATCH',
      url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
      headers: { cookie },
      payload: { name: '  ЗАНЯТО  ', iconKey: 'taxi' }
    });
    assert.equal(conflict.statusCode, 409, conflict.body);
    const stored = await app.prisma.transactionCategory.findUniqueOrThrow({
      where: { id: category.id }
    });
    assert.equal(stored.name, category.name);
    assert.equal(stored.iconKey, 'car');
  });

  it('allows names from another type, account or deleted category and simultaneous name/icon edits', async () => {
    const category = await createCategory('До границ');
    const otherAccount = await app.prisma.account.create({
      data: { name: 'Другая область', ownerId: 1n }
    });
    await app.prisma.transactionCategory.createMany({
      data: [
        {
          accountId,
          type: 'income',
          name: 'Другой тип',
          nameNormalized: 'другой тип'
        },
        {
          accountId: otherAccount.id,
          type: 'expense',
          name: 'Другой счёт',
          nameNormalized: 'другой счёт'
        },
        {
          accountId,
          type: 'expense',
          name: 'Удалённое имя',
          nameNormalized: 'удалённое имя',
          deletedAt: new Date()
        }
      ]
    });
    for (const name of ['Другой тип', 'Другой счёт', 'Удалённое имя']) {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
        headers: { cookie },
        payload: { name, iconKey: 'taxi' }
      });
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(response.json<{ name: string }>().name, name);
      assert.equal(response.json<{ iconKey: string }>().iconKey, 'taxi');
    }
  });

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
      url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
      headers: { cookie }
    });
    assert.equal(detail.json<{ iconKey: string }>().iconKey, 'groceries');
    const list = await app.inject({
      url: `/api/v1/accounts/${accountId}/categories?type=expense`,
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
        url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
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
        url: `/api/v1/accounts/${accountId}/categories/${category.id}`,
        headers: { cookie },
        payload
      });
      assert.equal(response.statusCode, 400, response.body);
    }
    const invalidCreate = await app.inject({
      method: 'POST',
      url: `/api/v1/accounts/${accountId}/categories`,
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
          url: `/api/v1/accounts/${accountId}/categories`,
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
        url: `/api/v1/accounts/${accountId}/categories/${id}`,
        headers: { cookie },
        payload: { name: 'Недоступное переименование', iconKey: 'taxi' }
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
      url: `/api/v1/accounts/${accountId}/categories/${foreign.id}`,
      payload: { iconKey: 'taxi' }
    });
    assert.equal(unauthenticated.statusCode, 401);
  });
});
