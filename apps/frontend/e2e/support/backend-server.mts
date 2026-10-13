import {
  createTestApp,
  prepareDatabase,
  startTestApp,
} from "./isolated-backend-server.mts";

prepareDatabase();
const { app } = await createTestApp();
await startTestApp(app);
