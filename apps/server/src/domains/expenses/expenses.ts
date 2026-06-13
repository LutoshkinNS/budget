import Expense from '#s/Expense.js';
import ExpenseCreate from '#s/ExpenseCreate.js';
import ExpenseUpdate from '#s/ExpenseUpdate.js';
import idObj from '#s/idObj.js';
import NotFoundError from '#s/NotFoundError.js';
import { FastifyApp } from '#src/appInit.js';

const notFound = (message: string) => ({
  code: 'NOT_FOUND' as const,
  message,
  statusCode: 404 as const
});

export default async function expensesModule(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'integer', minimum: 1 }
          }
        },
        response: { 200: { type: 'array', items: Expense } }
      }
    },
    async function (req) {
      const days = (req.query as { days?: number }).days ?? 2;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const expenses = await this.prisma.expense.findMany({
        where: {
          accountId: req.user.accountId,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' },
        include: {
          category: true,
          account: true
        }
      });
      return expenses.map((expense) => ({
        ...expense,
        userId: Number(expense.userId),
        date: expense.date.toISOString()
      }));
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 200: Expense, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const expense = await this.prisma.expense.findFirst({
        where: {
          id: req.params.id,
          accountId: req.user.accountId
        },
        include: {
          category: true,
          account: true
        }
      });

      if (!expense) {
        return reply.code(404).send(notFound('Expense not found or access denied'));
      }

      return {
        ...expense,
        userId: Number(expense.userId),
        date: expense.date.toISOString()
      };
    }
  );

  app.post(
    '/',
    {
      schema: {
        body: ExpenseCreate,
        response: { 200: Expense, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const accountId = req.user.accountId;

      const category = await this.prisma.category.findFirst({
        where: {
          id: req.body.categoryId,
          accountId,
          deletedAt: null
        }
      });

      if (!category) {
        return reply.code(404).send(notFound('Category not found or access denied'));
      }

      const result = await this.prisma.expense.create({
        data: {
          amount: req.body.amount,
          categoryId: req.body.categoryId,
          description: req.body.description ?? null,
          date: req.body.date ?? new Date(),
          accountId,
          userId: BigInt(req.user.userId)
        },
        include: {
          category: true,
          account: true
        }
      });
      return {
        ...result,
        userId: Number(result.userId),
        date: result.date.toISOString()
      };
    }
  );

  app.patch(
    '/:id',
    {
      schema: {
        params: idObj,
        body: ExpenseUpdate,
        response: { 200: Expense, 404: NotFoundError }
      }
    },
    async function (req, reply) {
      const accountId = req.user.accountId;

      const expense = await this.prisma.expense.findFirst({
        where: {
          id: req.params.id,
          accountId
        }
      });

      if (!expense) {
        return reply.code(404).send(notFound('Expense not found or access denied'));
      }

      const category = await this.prisma.category.findFirst({
        where: {
          id: req.body.categoryId,
          accountId,
          deletedAt: null
        }
      });

      if (!category) {
        return reply.code(404).send(notFound('Category not found or access denied'));
      }

      const description = req.body.description;
      const update = await this.prisma.expense.updateMany({
        where: { id: req.params.id, accountId },
        data: {
          amount: req.body.amount,
          categoryId: req.body.categoryId,
          description: description?.trim() ? description : null,
          date: req.body.date
        }
      });

      if (update.count === 0) {
        return reply.code(404).send(notFound('Expense not found or access denied'));
      }

      const result = await this.prisma.expense.findFirst({
        where: {
          id: req.params.id,
          accountId
        },
        include: {
          category: true,
          account: true
        }
      });

      if (!result) {
        return reply.code(404).send(notFound('Expense not found or access denied'));
      }

      return {
        ...result,
        userId: Number(result.userId),
        date: result.date.toISOString()
      };
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
      await this.prisma.expense.deleteMany({
        where: {
          id: req.params.id,
          accountId: req.user.accountId
        }
      });
      return reply.code(204).send(null);
    }
  );
}
