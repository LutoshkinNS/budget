import type { PrismaClient } from '#generated/prisma/index.js';

/**
 * Получает список всех аккаунтов пользователя
 * (как владельца, так и с общим доступом)
 */
export async function getAccountsList(prisma: PrismaClient, userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      ownedAccounts: true,
      accounts: {
        include: { account: true }
      }
    }
  });

  console.log('user', user);

  // Объединяем аккаунты, владельцем которых является пользователь,
  // и аккаунты, к которым у него есть доступ
  // Из user.accounts извлекаем вложенный объект account
  // Преобразуем Date в string для соответствия TypeSpec схеме
  const allAccounts = [
    ...user.ownedAccounts,
    ...user.accounts.map((au) => au.account)
  ];

  return allAccounts.map((acc) => ({
    ...acc,
    createdAt: acc.createdAt.toISOString()
  }));
}
