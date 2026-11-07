import { test as base } from "@playwright/test";

import {
  type Backend,
  parseBackend,
  withIsolatedBackend,
} from "./isolated-backend";

type InviteBackend = Backend & { code: string; targetAccountId: number };

function parseInviteBackend(value: unknown): InviteBackend {
  const backend = parseBackend(value);
  if (
    typeof value !== "object" ||
    value === null ||
    !("code" in value) ||
    typeof value.code !== "string" ||
    !("targetAccountId" in value) ||
    typeof value.targetAccountId !== "number"
  ) {
    throw new Error("Missing invitation metadata");
  }
  return {
    ...backend,
    code: value.code,
    targetAccountId: value.targetAccountId,
  };
}

export const test = base.extend<{ backend: InviteBackend }>({
  backend: [
    async ({ playwright: _playwright }, use) => {
      await withIsolatedBackend(
        new URL("./invite-server.mts", import.meta.url),
        parseInviteBackend,
        use,
      );
    },
    { timeout: 60_000 },
  ],
});
