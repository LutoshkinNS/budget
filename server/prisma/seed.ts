import { PrismaClient, Prisma } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

const categoryData: Prisma.CategoryCreateInput[] = [
    {
        name: "Продукты",
        user: {
            create: {}
        }
    },
    {
        name: "Транспорт",
        user: {
            create: {}
        }
    },
    {
        name: "Развлечения",
        user: {
            create: {}
        }
    },
    {
        name: "Здоровье",
        user: {
            create: {}
        }
    },
];

const expenseData: Prisma.ExpenseCreateInput[] = [
    {
        amount: 1500,
        description: "Продукты в супермаркете",
        date: new Date("2025-11-15"),
        user: {
            connect: { id: 1 }
        },
        category: {
            connect: { id: 1 }
        }
    },
    {
        amount: 250,
        description: "Проезд на метро",
        date: new Date("2025-11-16"),
        user: {
            connect: { id: 1 }
        },
        category: {
            connect: { id: 2 }
        }
    },
    {
        amount: 800,
        description: "Билеты в кино",
        date: new Date("2025-11-17"),
        user: {
            connect: { id: 1 }
        },
        category: {
            connect: { id: 3 }
        }
    },
    {
        amount: 2300,
        description: "Покупка продуктов на неделю",
        date: new Date("2025-11-18"),
        user: {
            connect: { id: 1 }
        },
        category: {
            connect: { id: 1 }
        }
    },
    {
        amount: 500,
        description: "Такси",
        date: new Date("2025-11-19"),
        user: {
            connect: { id: 1 }
        },
        category: {
            connect: { id: 2 }
        }
    },
    {
        amount: 1200,
        description: "Аптека - лекарства",
        date: new Date("2025-11-20"),
        user: {
            connect: { id: 1 }
        },
        category: {
            connect: { id: 4 }
        }
    },
];

export async function main() {
    for (const category of categoryData) {
        await prisma.category.create({ data: category });
    }
    for (const expense of expenseData) {
        await prisma.expense.create({ data: expense });
    }
}
main();