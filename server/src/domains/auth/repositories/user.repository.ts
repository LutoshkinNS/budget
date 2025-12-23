import type { PrismaClient } from '#generated/prisma/index.js';

/**
 * Находит пользователя по ID с его аккаунтами
 */
export async function findUserWithAccounts(
  prisma: PrismaClient,
  userId: number
) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAccounts: true,
      accounts: {
        include: { account: true }
      }
    }
  });
}

/**
 * Создаёт нового пользователя с персональным аккаунтом
 */
export async function createUserWithAccount(
  prisma: PrismaClient,
  userId: number
) {
  return prisma.user.create({
    data: {
      id: userId,
      ownedAccounts: {
        create: {
          name: `Account #${userId}`
        }
      }
    },
    include: {
      ownedAccounts: true,
      accounts: {
        include: { account: true }
      }
    }
  });
}

/**
 * Находит или создаёт пользователя
 */
export async function findOrCreateUser(prisma: PrismaClient, userId: number) {
  let user = await findUserWithAccounts(prisma, userId);

  if (!user) {
    user = await createUserWithAccount(prisma, userId);
  }

  return user;
}

/**
 * Получает первый доступный accountId для пользователя
 */
export function getFirstAccountId(
  user: Awaited<ReturnType<typeof findUserWithAccounts>>
) {
  if (!user) return null;
  return user.ownedAccounts[0]?.id || user.accounts[0]?.accountId || null;
}

/**
 * Получает информацию о пользователе и его аккаунтах
 */
export async function getUserInfo(
  prisma: PrismaClient,
  userId: number,
  currentAccountId: number
) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      ownedAccounts: true,
      accounts: {
        include: { account: true }
      }
    }
  });

  const accounts = [
    ...user.ownedAccounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      isOwner: true as const
    })),
    ...user.accounts.map((au) => ({
      id: au.account.id,
      name: au.account.name,
      isOwner: false as const
    }))
  ];

  return {
    userId: user.id,
    currentAccountId,
    accounts
  };
}
