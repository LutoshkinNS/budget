import type { PrismaClient } from '#generated/prisma/index.js';

/**
 * Находит пользователя по ID с его аккаунтами
 */
export async function findUserWithAccounts(
  prisma: PrismaClient,
  userId: bigint
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
  userId: bigint
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
 * Upsert пользователя по Telegram payload — обновляет firstName/photoUrl
 * на каждом login.
 */
export async function upsertUserFromTelegram(
  prisma: PrismaClient,
  payload: { id: bigint; first_name: string; photo_url?: string | undefined }
) {
  return prisma.user.upsert({
    where: { id: payload.id },
    update: {
      firstName: payload.first_name,
      photoUrl: payload.photo_url ?? null
    },
    create: {
      id: payload.id,
      firstName: payload.first_name,
      photoUrl: payload.photo_url ?? null,
      ownedAccounts: {
        create: {
          name: `Account #${payload.id}`
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
 * Находит или создаёт пользователя по Telegram ID
 */
export async function findOrCreateUser(prisma: PrismaClient, userId: bigint) {
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
    where: { id: BigInt(userId) },
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
    userId,
    currentAccountId,
    accounts
  };
}
