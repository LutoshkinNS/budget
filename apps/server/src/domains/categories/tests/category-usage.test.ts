import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  vi
} from 'vitest';

import appInit from '#src/app-init.js';

import subcategoriesModule from '../../subcategories/subcategories.js';
import transactionsModule from '../../transactions/transactions.js';
import categoriesRoutes from '../routes.js';

const require = createRequire(import.meta.url);
const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const directory = mkdtempSync(join(tmpdir(), 'budget-category-usage-'));
const databaseUrl = 'file:' + join(directory, 'test.db').split('\\').join('/');
const now = new Date('2026-10-15T12:00:00.000Z');
const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
Object.assign(process.env, {
  DATABASE_URL: databaseUrl,
  PORT: '3000',
  JWT_SECRET: 'category-usage-isolated-test-secret',
  FRONTEND_URL: 'http://127.0.0.1:3001',
  NODE_ENV: 'test',
  TELEGRAM_BOT_TOKEN: 'category-usage-test-token'
});
const app = await appInit();
let accountId = 0;
let otherAccountId = 0;
const cookies = new Map<number, string>();

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
  await app.prisma.user.createMany({
    data: [{ id: 1n }, { id: 2n }, { id: 3n }]
  });
  const account = await app.prisma.account.create({
    data: { name: 'Общий счёт', ownerId: 1n }
  });
  accountId = account.id;
  otherAccountId = (
    await app.prisma.account.create({
      data: { name: 'Другой счёт', ownerId: 3n }
    })
  ).id;
  await app.prisma.accountUser.create({
    data: { accountId, userId: 2n }
  });
  await app.register(categoriesRoutes, {
    prefix: '/api/v1/accounts/:accountId/categories'
  });
  await app.register(subcategoriesModule, {
    prefix: '/api/v1/accounts/:accountId/categories/:categoryId/subcategories'
  });
  await app.register(transactionsModule, {
    prefix: '/api/v1/accounts/:accountId/transactions'
  });
  app.get<{ Querystring: { userId: string } }>(
    '/test-token',
    async (request, reply) =>
      reply.accessJwtSign({
        userId: Number(request.query.userId)
      })
  );
  await app.ready();
  for (const userId of [1, 2, 3]) {
    const token = await app.inject(`/test-token?userId=${userId}`);
    cookies.set(userId, 'accessToken=' + token.body);
  }
});

beforeEach(async () => {
  await app.prisma.transaction.deleteMany();
  await app.prisma.transactionCategory.deleteMany();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

afterAll(async () => {
  vi.useRealTimers();
  await app.close();
  await app.prisma.$disconnect();
  // Удаляется только каталог, созданный этим тестом внутри системного temp.
  if (directory.startsWith(join(tmpdir(), 'budget-category-usage-'))) {
    rmSync(directory, { recursive: true, force: true });
  }
});

async function createCategory(
  name: string,
  type: 'income' | 'expense' = 'expense',
  categoryAccountId = accountId
) {
  const category = await app.prisma.transactionCategory.create({
    data: {
      accountId: categoryAccountId,
      type,
      name,
      nameNormalized: name.toLocaleLowerCase('ru')
    }
  });
  return category;
}

async function createTransaction(
  categoryId: number,
  options: {
    accountId?: number;
    userId?: bigint;
    type?: 'income' | 'expense';
    date?: Date;
    amount?: number;
  } = {}
) {
  return app.prisma.transaction.create({
    data: {
      accountId: options.accountId ?? accountId,
      userId: options.userId ?? 1n,
      type: options.type ?? 'expense',
      categoryId,
      date: options.date ?? now,
      amount: options.amount ?? 1
    }
  });
}

async function listCategories(
  userId = 1,
  query = 'sort=usage&type=expense',
  scopeAccountId = userId === 3 ? otherAccountId : accountId
) {
  return app.inject({
    url: `/api/v1/accounts/${scopeAccountId}/categories?${query}`,
    headers: { cookie: cookies.get(userId) }
  });
}

function categoryIds(response: { json: () => Array<{ id: number }> }) {
  return response.json().map(({ id }) => id);
}

describe('category usage ordering API', () => {
  it('orders active categories by personal operation count, then Russian name and id', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    const frequent = await createCategory('Частая');
    const twoUses = await createCategory('Две операции');
    const tiedZulu = await createCategory('Яблоко');
    const tiedAlpha = await createCategory('Апельсин');
    const sameNameOtherType = await createCategory('Апельсин', 'income');
    const unused = await createCategory('Без операций');
    const deleted = await createCategory('Удалённая');
    const income = await createCategory('Доход', 'income');
    const foreign = await createCategory(
      'Чужой счёт',
      'expense',
      otherAccountId
    );

    for (let index = 0; index < 4; index += 1) {
      await createTransaction(frequent.id, { amount: index + 1 });
    }
    for (let index = 0; index < 2; index += 1) {
      await createTransaction(twoUses.id);
    }
    await createTransaction(tiedZulu.id);
    await createTransaction(tiedAlpha.id);
    await createTransaction(sameNameOtherType.id, { type: 'income' });
    await createTransaction(foreign.id, { accountId: otherAccountId });
    await createTransaction(frequent.id, { userId: 2n });
    await createTransaction(income.id, { type: 'income' });
    await app.prisma.transactionCategory.update({
      where: { id: deleted.id },
      data: { deletedAt: now }
    });

    const response = await listCategories();
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(categoryIds(response), [
      frequent.id,
      twoUses.id,
      tiedAlpha.id,
      tiedZulu.id,
      unused.id
    ]);
    assert.equal(
      response.json<Array<{ id: number; name: string; accountId: number }>>()[0]
        .accountId,
      accountId
    );
    assert.deepEqual(categoryIds(await listCategories(2)), [
      frequent.id,
      tiedAlpha.id,
      unused.id,
      twoUses.id,
      tiedZulu.id
    ]);
    assert.deepEqual(categoryIds(await listCategories(1, 'sort=usage')), [
      frequent.id,
      twoUses.id,
      tiedAlpha.id,
      sameNameOtherType.id,
      income.id,
      tiedZulu.id,
      unused.id
    ]);
    assert.deepEqual(categoryIds(await listCategories(3)), [foreign.id]);
  });

  it.each([
    { name: 'includes the lower 90-day boundary', date: start, included: true },
    { name: 'includes the upper boundary', date: now, included: true },
    {
      name: 'excludes an operation 1 ms before the lower boundary',
      date: new Date(start.getTime() - 1),
      included: false
    },
    {
      name: 'excludes an operation 1 ms after the upper boundary',
      date: new Date(now.getTime() + 1),
      included: false
    }
  ])('$name', async ({ date, included }) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    const unused = await createCategory('Альфа без операций');
    const boundary = await createCategory('Яблоко на границе');
    await createTransaction(boundary.id, { date });

    assert.deepEqual(
      categoryIds(await listCategories()),
      included ? [boundary.id, unused.id] : [unused.id, boundary.id]
    );
  });

  it('recalculates after transaction edits and deletion without double-counting saves', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    const first = await createCategory('Альфа');
    const second = await createCategory('Яблоко');
    const transaction = await createTransaction(first.id, { userId: 2n });
    assert.deepEqual(categoryIds(await listCategories(2)), [
      first.id,
      second.id
    ]);

    const updated = await app.inject({
      method: 'PATCH',
      url: `/api/v1/accounts/${accountId}/transactions/${transaction.id}`,
      headers: { cookie: cookies.get(1) },
      payload: {
        type: 'expense',
        amount: 1,
        categoryId: second.id,
        date: start.toISOString(),
        description: 'Изменено другим участником'
      }
    });
    assert.equal(updated.statusCode, 200, updated.body);
    assert.equal(updated.json<{ userId: number }>().userId, 2);
    assert.deepEqual(categoryIds(await listCategories(2)), [
      second.id,
      first.id
    ]);

    const savedAgain = await app.inject({
      method: 'PATCH',
      url: `/api/v1/accounts/${accountId}/transactions/${transaction.id}`,
      headers: { cookie: cookies.get(1) },
      payload: {
        type: 'expense',
        amount: 1,
        categoryId: second.id,
        date: start.toISOString(),
        description: 'Сохранено повторно'
      }
    });
    assert.equal(savedAgain.statusCode, 200, savedAgain.body);
    assert.equal(savedAgain.json<{ userId: number }>().userId, 2);
    assert.deepEqual(categoryIds(await listCategories(2)), [
      second.id,
      first.id
    ]);

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/v1/accounts/${accountId}/transactions/${transaction.id}`,
      headers: { cookie: cookies.get(1) }
    });
    assert.equal(deleted.statusCode, 204, deleted.body);
    assert.deepEqual(categoryIds(await listCategories(2)), [
      first.id,
      second.id
    ]);
    const stored = await app.prisma.transaction.findUnique({
      where: { id: transaction.id }
    });
    assert.equal(stored, null);
  });

  it('keeps the default list path and rejects unsupported sort values', async () => {
    const category = await createCategory('Без сортировки');
    const normal = await app.inject({
      url: `/api/v1/accounts/${accountId}/categories?type=expense`,
      headers: { cookie: cookies.get(1) }
    });
    assert.equal(normal.statusCode, 200, normal.body);
    assert.ok(categoryIds(normal).includes(category.id));

    const invalid = await listCategories(1, 'sort=name');
    assert.equal(invalid.statusCode, 400, invalid.body);
  });

  it('rejects account without membership with 403 and keeps the account explicit in the path', async () => {
    await createCategory('Недоступная частота');
    const foreign = await app.inject({
      url: `/api/v1/accounts/${accountId}/categories?sort=usage`,
      headers: { cookie: cookies.get(3) }
    });
    assert.equal(foreign.statusCode, 403, foreign.body);
    assert.equal(foreign.json<{ code: string }>().code, 'FORBIDDEN');

    const missing = await app.inject({
      url: '/api/v1/accounts/999999/categories',
      headers: { cookie: cookies.get(1) }
    });
    assert.equal(missing.statusCode, 403, missing.body);

    const member = await app.inject({
      url: `/api/v1/accounts/${accountId}/categories`,
      headers: { cookie: cookies.get(2) }
    });
    assert.equal(member.statusCode, 200, member.body);
  });

  it('does not read or change an entity of another account under an accessible account path', async () => {
    await app.prisma.accountUser.create({
      data: { accountId: otherAccountId, userId: 1n }
    });
    const foreignCategory = await app.prisma.transactionCategory.create({
      data: {
        accountId: otherAccountId,
        type: 'expense',
        name: 'Чужая сущность',
        nameNormalized: 'чужая сущность'
      }
    });
    const foreignTransaction = await app.prisma.transaction.create({
      data: {
        accountId: otherAccountId,
        userId: 3n,
        categoryId: foreignCategory.id,
        type: 'expense',
        amount: 5,
        date: now
      }
    });

    const path = (entity: string) =>
      `/api/v1/accounts/${accountId}/${entity}`;
    const requests = [
      { method: 'GET', url: path(`categories/${foreignCategory.id}`) },
      {
        method: 'PATCH',
        url: path(`categories/${foreignCategory.id}`),
        payload: { name: 'Не должно сохраниться' }
      },
      { method: 'GET', url: path(`transactions/${foreignTransaction.id}`) },
      {
        method: 'POST',
        url: path(`categories/${foreignCategory.id}/subcategories`),
        payload: { name: 'Подкатегория чужой категории' }
      }
    ] as const;

    for (const req of requests) {
      const response = await app.inject({
        method: req.method,
        url: req.url,
        headers: { cookie: cookies.get(1) },
        ...('payload' in req ? { payload: req.payload } : {})
      });
      // 404 скрывает существование сущности в другом счёте.
      assert.equal(response.statusCode, 404, `${req.method} ${req.url}`);
    }

    const stored = await app.prisma.transactionCategory.findUniqueOrThrow({
      where: { id: foreignCategory.id }
    });
    assert.equal(stored.name, 'Чужая сущность');
    assert.equal(
      await app.prisma.subcategory.count({
        where: { categoryId: foreignCategory.id }
      }),
      0
    );
  });
});
