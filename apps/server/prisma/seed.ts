import { Prisma, PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

export async function main() {
  // Создаём пользователя с личным аккаунтом
  const user = await prisma.user.create({
    data: {
      id: BigInt(1),
      ownedAccounts: {
        create: {
          name: 'Личный бюджет',
          initialBalance: 0
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
  const categoryData: Prisma.TransactionCategoryCreateInput[] = [
    {
      name: 'Продукты',
      nameNormalized: 'продукты',
      type: 'expense',
      account: { connect: { id: accountId } }
    },
    {
      name: 'Транспорт',
      nameNormalized: 'транспорт',
      type: 'expense',
      account: { connect: { id: accountId } }
    },
    {
      name: 'Развлечения',
      nameNormalized: 'развлечения',
      type: 'expense',
      account: { connect: { id: accountId } }
    },
    {
      name: 'Здоровье',
      nameNormalized: 'здоровье',
      type: 'expense',
      account: { connect: { id: accountId } }
    }
  ];

  const categories = [];
  for (const category of categoryData) {
    const created = await prisma.transactionCategory.create({ data: category });
    categories.push(created);
  }

  // Расходы для этого аккаунта
  const expenseData: Prisma.TransactionCreateInput[] = [
    {
      amount: 1500,
      description: 'Продукты в супермаркете',
      date: new Date('2025-11-15'),
      type: 'expense',
      account: { connect: { id: accountId } },
      category: { connect: { id: categories[0].id } },
      user: { connect: { id: user.id } }
    },
    {
      amount: 250,
      description: 'Проезд на метро',
      date: new Date('2025-11-16'),
      type: 'expense',
      account: { connect: { id: accountId } },
      category: { connect: { id: categories[1].id } },
      user: { connect: { id: user.id } }
    },
    {
      amount: 800,
      description: 'Билеты в кино',
      date: new Date('2025-11-17'),
      type: 'expense',
      account: { connect: { id: accountId } },
      category: { connect: { id: categories[2].id } },
      user: { connect: { id: user.id } }
    },
    {
      amount: 2300,
      description: 'Покупка продуктов на неделю',
      date: new Date('2025-11-18'),
      type: 'expense',
      account: { connect: { id: accountId } },
      category: { connect: { id: categories[0].id } },
      user: { connect: { id: user.id } }
    },
    {
      amount: 500,
      description: 'Такси',
      date: new Date('2025-11-19'),
      type: 'expense',
      account: { connect: { id: accountId } },
      category: { connect: { id: categories[1].id } },
      user: { connect: { id: user.id } }
    },
    {
      amount: 1200,
      description: 'Аптека - лекарства',
      date: new Date('2025-11-20'),
      type: 'expense',
      account: { connect: { id: accountId } },
      category: { connect: { id: categories[3].id } },
      user: { connect: { id: user.id } }
    }
  ];

  for (const expense of expenseData) {
    await prisma.transaction.create({ data: expense });
  }

  console.log(`✅ Создан пользователь с ID: ${user.id}`);
  console.log(`✅ Создан аккаунт: ${user.ownedAccounts[0].name}`);
  console.log(`✅ Создано категорий: ${categories.length}`);
  console.log(`✅ Создано расходов: ${expenseData.length}`);
}
main();
