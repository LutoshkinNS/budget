import { test as base } from "@playwright/test";

import {
  type Backend,
  parseBackend,
  withIsolatedBackend,
} from "./isolated-backend";

export const test = base.extend<Record<never, never>, { backend: Backend }>({
  backend: [
    async ({ playwright: _playwright }, use) => {
      await withIsolatedBackend(
        new URL("./backend-server.mts", import.meta.url),
        parseBackend,
        use,
      );
    },
    { scope: "worker", timeout: 60000 },
  ],
});
