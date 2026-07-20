import CategorySummary from '#s/CategorySummary.js';
import idObj from '#s/idObj.js';
import NotFoundError from '#s/NotFoundError.js';
import Transaction from '#s/Transaction.js';
import TransactionCreate from '#s/TransactionCreate.js';
import TransactionSummary from '#s/TransactionSummary.js';
import TransactionUpdate from '#s/TransactionUpdate.js';
import ValidationError from '#s/ValidationError.js';
import { FastifyApp } from '#src/appInit.js';

import { calculateTransactionSummary } from './balance.js';
import { buildCategorySummaryResponse } from './category-summary.js';

const transactionTypes = ['income', 'expense'] as const;

type TransactionType = (typeof transactionTypes)[number];

const notFound = (message: string) => ({
  code: 'NOT_FOUND' as const,
  message,
  statusCode: 404 as const
});

const validationError = (message: string) => ({
  code: 'VALIDATION_ERROR' as const,
  message,
  statusCode: 400 as const
});

function isTransactionType(type: string): type is TransactionType {
  return transactionTypes.includes(type as TransactionType);
}

function parseDateRange(query: { from: string; to: string }) {
  const from = new Date(query.from);
  const to = new Date(query.to);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return validationError(
      'Query parameters from and to must be valid date-time values'
    );
  }

  if (from >= to) {
    return validationError('Query parameter from must be earlier than to');
  }

  return { from, to };
}

function parseCategoryId(categoryId: unknown) {
  if (categoryId === undefined) {
    return undefined;
  }

  if (
    typeof categoryId !== 'number' ||
    !Number.isInteger(categoryId) ||
    categoryId < 1
  ) {
    return validationError(
      'Query parameter categoryId must be a positive integer'
    );
  }

  return categoryId;
}

function serializeTransaction<
  T extends { type: string; userId: bigint; date: Date }
>(transaction: T) {
  return {
    ...transaction,
    type: transaction.type as TransactionType,
    userId: Number(transaction.userId),
    date: transaction.date.toISOString()
  };
}

function readGroupedTotal(
  groups: Array<{ type: string; _sum: { amount: number | null } }>,
  type: TransactionType
) {
  return groups.find((group) => group.type === type)?._sum.amount ?? 0;
}

async function validateCategory(
  app: FastifyApp,
  categoryId: number,
  accountId: number,
  transactionType: TransactionType
) {
  const category = await app.prisma.transactionCategory.findFirst({
    where: {
      id: categoryId,
      accountId,
      deletedAt: null
    }
  });

  if (!category) {
    return notFound('Category not found or access denied');
  }

  if (category.type !== transactionType) {
    return validationError('Category type must match transaction type');
  }

  return category;
}

async function validateCategoryFilter(
  app: FastifyApp,
  categoryId: number,
  accountId: number,
  transactionType?: TransactionType
) {
  const category = await app.prisma.transactionCategory.findFirst({
    where: {
      id: categoryId,
      accountId
    }
  });

  if (!category) {
    return notFound('Category not found or access denied');
  }

  if (transactionType !== undefined && category.type !== transactionType) {
    return validationError('Category type must match transaction type');
  }

  return category;
}

export default async function transactionsModule(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', format: 'date-time' },
            to: { type: 'string', format: 'date-time' },
            type: { type: 'string', enum: transactionTypes },
            categoryId: { type: 'integer', minimum: 1 }
          },
          additionalProperties: false
        },
        response: {
          200: { type: 'array', items: Transaction },
          400: ValidationError,
          404: NotFoundError
        }
      }
    },
    async function (req, reply) {
      const dateRange = parseDateRange(req.query);

      if ('statusCode' in dateRange) {
        return reply.code(400).send(dateRange);
      }

      const type = req.query.type;
      const categoryId = parseCategoryId(req.query.categoryId);

      if (type !== undefined && !isTransactionType(type)) {
        return reply
          .code(400)
          .send(
            validationError('Query parameter type must be income or expense')
          );
      }

      if (categoryId !== undefined && typeof categoryId !== 'number') {
        return reply.code(400).send(categoryId);
      }

      if (categoryId !== undefined) {
        const category = await validateCategoryFilter(
          this,
          categoryId,
          req.user.accountId,
          type
        );

        if ('statusCode' in category) {
          return reply.code(category.statusCode).send(category);
        }
      }

      const transactions = await this.prisma.transaction.findMany({
        where: {
          accountId: req.user.accountId,
          date: { gte: dateRange.from, lt: dateRange.to },
          ...(type === undefined ? {} : { type }),
          ...(categoryId === undefined ? {} : { categoryId })
        },
        orderBy: { date: 'desc' }
      });

      return transactions.map(serializeTransaction);
    }
  );

  app.get(
    '/category-summary',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['from', 'to', 'compareFrom', 'compareTo'],
          properties: {
            from: { type: 'string', format: 'date-time' },
            to: { type: 'string', format: 'date-time' },
            compareFrom: { type: 'string', format: 'date-time' },
            compareTo: { type: 'string', format: 'date-time' }
          },
          additionalProperties: false
        },
        response: { 200: CategorySummary, 400: ValidationError }
      }
    },
    async function (req, reply) {
      const currentRange = parseDateRange(req.query);
      const previousRange = parseDateRange({
        from: req.query.compareFrom,
        to: req.query.compareTo
      });

      if ('statusCode' in currentRange) {
        return reply.code(400).send(currentRange);
      }

      if ('statusCode' in previousRange) {
        return reply.code(400).send(previousRange);
      }

      const accountId = req.user.accountId;
      const expenseWhere = {
        accountId,
        type: 'expense'
      };
      const [currentGroups, previousGroups] = await Promise.all([
        this.prisma.transaction.groupBy({
          by: ['categoryId'],
          where: {
            ...expenseWhere,
            date: { gte: currentRange.from, lt: currentRange.to }
          },
          _sum: { amount: true },
          _count: { _all: true }
        }),
        this.prisma.transaction.groupBy({
          by: ['categoryId'],
          where: {
            ...expenseWhere,
            date: { gte: previousRange.from, lt: previousRange.to }
          },
          _sum: { amount: true }
        })
      ]);
      const categories = await this.prisma.transactionCategory.findMany({
        where: {
          id: { in: currentGroups.map((group) => group.categoryId) },
          accountId
        },
        select: { id: true, name: true }
      });
      const categoryNames = new Map(
        categories.map((category) => [category.id, category.name])
      );

      return buildCategorySummaryResponse({
        current: currentGroups.flatMap((group) => {
          const categoryName = categoryNames.get(group.categoryId);

          return categoryName === undefined
            ? []
            : [
                {
                  categoryId: group.categoryId,
                  categoryName,
                  amount: group._sum.amount ?? 0,
                  transactionCount: group._count._all
                }
              ];
        }),
        previous: previousGroups.map((group) => ({
          categoryId: group.categoryId,
          amount: group._sum.amount ?? 0
        }))
      });
    }
  );

  app.get(
    '/summary',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', format: 'date-time' },
            to: { type: 'string', format: 'date-time' }
          },
          additionalProperties: false
        },
        response: {
          200: TransactionSummary,
          400: ValidationError,
          404: NotFoundError
        }
      }
    },
    async function (req, reply) {
      const dateRange = parseDateRange(req.query);

      if ('statusCode' in dateRange) {
        return reply.code(400).send(dateRange);
      }

      const accountId = req.user.accountId;
      const [account, periodGroups] = await Promise.all([
        this.prisma.account.findFirst({
          where: { id: accountId }
        }),
        this.prisma.transaction.groupBy({
          by: ['type'],
          where: {
            accountId,
            date: { gte: dateRange.from, lt: dateRange.to }
          },
          _sum: { amount: true }
        })
      ]);

      if (!account) {
        return reply
          .code(404)
          .send(notFound('Account not found or access denied'));
      }

      const balanceGroups = await this.prisma.transaction.groupBy({
        by: ['type'],
        where: {
          accountId,
          date: { gte: account.initialBalanceDate }
        },
        _sum: { amount: true }
      });

      const incomeTotal = readGroupedTotal(periodGroups, 'income');
      const expenseTotal = readGroupedTotal(periodGroups, 'expense');
      const balanceIncomeTotal = readGroupedTotal(balanceGroups, 'income');
      const balanceExpenseTotal = readGroupedTotal(balanceGroups, 'expense');

      return calculateTransactionSummary({
        initialBalance: account.initialBalance,
        periodIncomeTotal: incomeTotal,
        periodExpenseTotal: expenseTotal,
        balanceIncomeTotal,
        balanceExpenseTotal
      });
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 200: Transaction, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          accountId: req.user.accountId
        }
      });

      if (!transaction) {
        return reply
          .code(404)
          .send(notFound('Transaction not found or access denied'));
      }

      return serializeTransaction(transaction);
    }
  );

  app.post(
    '/',
    {
      schema: {
        body: TransactionCreate,
        response: { 200: Transaction, 400: ValidationError, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const accountId = req.user.accountId;
      const category = await validateCategory(
        this,
        req.body.categoryId,
        accountId,
        req.body.type
      );

      if ('statusCode' in category) {
        return reply.code(category.statusCode).send(category);
      }

      const result = await this.prisma.transaction.create({
        data: {
          amount: req.body.amount,
          categoryId: req.body.categoryId,
          type: req.body.type,
          description: req.body.description ?? null,
          date: req.body.date ?? new Date(),
          accountId,
          userId: BigInt(req.user.userId)
        }
      });

      return serializeTransaction(result);
    }
  );

  app.patch(
    '/:id',
    {
      schema: {
        params: idObj,
        body: TransactionUpdate,
        response: { 200: Transaction, 400: ValidationError, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const accountId = req.user.accountId;

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          accountId
        }
      });

      if (!transaction) {
        return reply
          .code(404)
          .send(notFound('Transaction not found or access denied'));
      }

      const category = await validateCategory(
        this,
        req.body.categoryId,
        accountId,
        req.body.type
      );

      if ('statusCode' in category) {
        return reply.code(category.statusCode).send(category);
      }

      const description = req.body.description;
      const update = await this.prisma.transaction.updateMany({
        where: { id: req.params.id, accountId },
        data: {
          amount: req.body.amount,
          categoryId: req.body.categoryId,
          type: req.body.type,
          description: description?.trim() ? description : null,
          date: req.body.date
        }
      });

      if (update.count === 0) {
        return reply
          .code(404)
          .send(notFound('Transaction not found or access denied'));
      }

      const result = await this.prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          accountId
        }
      });

      if (!result) {
        return reply
          .code(404)
          .send(notFound('Transaction not found or access denied'));
      }

      return serializeTransaction(result);
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 204: { type: 'null' } }
      }
    },
    async function (req, reply) {
      await this.prisma.transaction.deleteMany({
        where: {
          id: req.params.id,
          accountId: req.user.accountId
        }
      });

      return reply.code(204).send(null);
    }
  );
}
