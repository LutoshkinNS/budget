import Expense from '#s/Expense.js';
import ExpenseCreate from '#s/ExpenseCreate.js';
import idObj from '#s/idObj.js';
import { FastifyApp } from '#src/appInit.js';

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
        response: { 200: Expense }
      }
    },
    async function (req) {
      const expense = await this.prisma.expense.findFirstOrThrow({
        where: {
          id: req.params.id,
          accountId: req.user.accountId
        },
        include: {
          category: true,
          account: true
        }
      });
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
        response: { 200: Expense }
      }
    },
    async function (req) {
      const accountId = req.user.accountId;

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
