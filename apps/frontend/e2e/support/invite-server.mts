import {
  createTestApp,
  prepareDatabase,
  startTestApp,
} from "./isolated-backend-server.mts";

prepareDatabase();
const { app } = await createTestApp();
await app.prisma.user.create({ data: { id: 2n, firstName: "Владелец" } });
const account = await app.prisma.account.create({
  data: { name: "Приглашённый бюджет", ownerId: 2n },
});
const invitation = await app.prisma.accountInvitation.create({
  data: {
    code: "test-invitation",
    accountId: account.id,
    createdBy: 2n,
    expiresAt: new Date(Date.now() + 3_600_000),
  },
});
await startTestApp(app, {
  code: invitation.code,
  targetAccountId: account.id,
});
