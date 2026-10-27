import type { PrismaClient } from '#generated/prisma/index.js';

export async function getAccountsList(prisma: PrismaClient, userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: BigInt(userId) },
    include: {
      ownedAccounts: true,
      accounts: {
        include: { account: true }
      }
    }
  });

  const ownedAccountIds = new Set(user.ownedAccounts.map((account) => account.id));
  const allAccounts = [
    ...user.ownedAccounts,
    ...user.accounts
      .map((accountUser) => accountUser.account)
      .filter((account) => !ownedAccountIds.has(account.id))
  ];

  return allAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    initialBalance: acc.initialBalance,
    ownerId: Number(acc.ownerId),
    createdAt: acc.createdAt.toISOString()
  }));
}
