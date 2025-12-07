import { PrismaClient, Prisma } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export async function main() {
    // Создаём пользователя с личным аккаунтом
    const user = await prisma.user.create({
        data: {
            ownedAccounts: {
                create: {
                    name: "Личный бюджет"
                }
            }
        },
        include: {
            ownedAccounts: true
        }
    });

    const accountId = user.ownedAccounts[0].id;

    // Добавляем пользователя в свой аккаунт
    await prisma.accountUser.create({
        data: {
            userId: user.id,
            accountId: accountId
        }
    });

    // Категории для этого аккаунта
    const categoryData: Prisma.CategoryCreateInput[] = [
        {
            name: "Продукты",
            account: { connect: { id: accountId } }
        },
        {
            name: "Транспорт",
            account: { connect: { id: accountId } }
        },
        {
            name: "Развлечения",
            account: { connect: { id: accountId } }
        },
        {
            name: "Здоровье",
            account: { connect: { id: accountId } }
        },
    ];

    const categories = [];
    for (const category of categoryData) {
        const created = await prisma.category.create({ data: category });
        categories.push(created);
    }

    // Расходы для этого аккаунта
    const expenseData: Prisma.ExpenseCreateInput[] = [
        {
            amount: 1500,
            description: "Продукты в супермаркете",
            date: new Date("2025-11-15"),
            account: { connect: { id: accountId } },
            category: { connect: { id: categories[0].id } }
        },
        {
            amount: 250,
            description: "Проезд на метро",
            date: new Date("2025-11-16"),
            account: { connect: { id: accountId } },
            category: { connect: { id: categories[1].id } }
        },
        {
            amount: 800,
            description: "Билеты в кино",
            date: new Date("2025-11-17"),
            account: { connect: { id: accountId } },
            category: { connect: { id: categories[2].id } }
        },
        {
            amount: 2300,
            description: "Покупка продуктов на неделю",
            date: new Date("2025-11-18"),
            account: { connect: { id: accountId } },
            category: { connect: { id: categories[0].id } }
        },
        {
            amount: 500,
            description: "Такси",
            date: new Date("2025-11-19"),
            account: { connect: { id: accountId } },
            category: { connect: { id: categories[1].id } }
        },
        {
            amount: 1200,
            description: "Аптека - лекарства",
            date: new Date("2025-11-20"),
            account: { connect: { id: accountId } },
            category: { connect: { id: categories[3].id } }
        },
    ];

    for (const expense of expenseData) {
        await prisma.expense.create({ data: expense });
    }

    console.log(`✅ Создан пользователь с ID: ${user.id}`);
    console.log(`✅ Создан аккаунт: ${user.ownedAccounts[0].name}`);
    console.log(`✅ Создано категорий: ${categories.length}`);
    console.log(`✅ Создано расходов: ${expenseData.length}`);
}
main();
