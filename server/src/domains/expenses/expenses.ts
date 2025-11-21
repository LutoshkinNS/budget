import {FastifyApp} from "#src/appInit.js";
import Expense from "#s/Expense.js";
import idObj from "#s/idObj.js";
import ExpenseCreate from "#s/ExpenseCreate.js";

export default async function expensesModule(app: FastifyApp) {
    app.get('/', {
        schema: {
            response: {200: {type: 'array', items: Expense}}
        }
    }, async function () {
        const expenses = await this.prisma.expense.findMany({
            include: {
                category: true,
                user: true
            }
        });
        return expenses.map(expense => ({
            ...expense,
            date: expense.date.toISOString()
        }));
    })

    app.get('/:id', {
        schema: {
            params: idObj,
            response: {200: Expense}
        }
    }, async function (req) {
        const expense = await this.prisma.expense.findUniqueOrThrow({
            where: {id: req.params.id},
            include: {
                category: true,
                user: true
            }
        });
        return {
            ...expense,
            date: expense.date.toISOString()
        };
    })

    app.post('/', {
        schema: {
            body: ExpenseCreate,
            response: {200: Expense}
        }
    }, async function (req) {
        const result = await this.prisma.expense.create({
            data: {
                amount: req.body.amount,
                categoryId: req.body.categoryId,
                description: req.body.description,
                date: new Date(req.body.date),
                userId: 1
            },
            include: {
                category: true,
                user: true
            }
        })
        return {
            ...result,
            date: result.date.toISOString()
        };
    })

    app.delete('/:id', {
        schema: {
            params: idObj,
            response: {204: {type: 'null'}}
        }
    }, async function (req, reply) {
        await this.prisma.expense.delete({
            where: {id: req.params.id}
        });
        return reply.code(204).send();
    })
}