import type { PrismaClient } from '#generated/prisma/index.js';

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

export async function findOrCreateUser(prisma: PrismaClient, userId: bigint) {
  let user = await findUserWithAccounts(prisma, userId);

  if (!user) {
    user = await createUserWithAccount(prisma, userId);
  }

  return user;
}

export function getFirstAccountId(
  user: Awaited<ReturnType<typeof findUserWithAccounts>>
) {
  if (!user) return null;
  return user.ownedAccounts[0]?.id || user.accounts[0]?.accountId || null;
}

export async function getUserInfo(prisma: PrismaClient, userId: number) {
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
      initialBalance: acc.initialBalance,
      isOwner: true as const
    })),
    ...user.accounts.map((au) => ({
      id: au.account.id,
      name: au.account.name,
      initialBalance: au.account.initialBalance,
      isOwner: false as const
    }))
  ];

  return {
    userId,
    accounts
  };
}
