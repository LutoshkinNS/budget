import {
  createTestApp,
  prepareDatabase,
  startTestApp,
} from "./isolated-backend-server.mts";

prepareDatabase();
const { app, account } = await createTestApp();
const secondaryAccount = await app.prisma.account.create({
  data: {
    name: "Другой бюджет",
    initialBalanceDate: new Date("2000-01-01T00:00:00.000Z"),
    ownerId: account.ownerId,
    users: { create: { userId: account.ownerId } },
  },
});
await startTestApp(app, {
  primaryAccountId: account.id,
  secondaryAccountId: secondaryAccount.id,
});
