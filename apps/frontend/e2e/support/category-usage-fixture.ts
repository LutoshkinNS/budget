import { test as base } from "@playwright/test";

import {
  type Backend,
  parseBackend,
  withIsolatedBackend,
} from "./isolated-backend";

type CategoryUsageBackend = Backend & {
  primaryAccountId: number;
  secondaryAccountId: number;
};

function parseCategoryUsageBackend(value: unknown): CategoryUsageBackend {
  const backend = parseBackend(value);
  if (
    typeof value !== "object" ||
    value === null ||
    !("primaryAccountId" in value) ||
    typeof value.primaryAccountId !== "number" ||
    !("secondaryAccountId" in value) ||
    typeof value.secondaryAccountId !== "number"
  ) {
    throw new Error("Missing category usage account IDs");
  }
  return {
    ...backend,
    primaryAccountId: value.primaryAccountId,
    secondaryAccountId: value.secondaryAccountId,
  };
}

export const test = base.extend<{ backend: CategoryUsageBackend }>({
  backend: [
    async ({ playwright: _playwright }, use) => {
      // Список содержит все категории счёта, поэтому каждому сценарию нужна своя БД.
      await withIsolatedBackend(
        new URL("./category-usage-server.mts", import.meta.url),
        parseCategoryUsageBackend,
        use,
      );
    },
    { timeout: 60000 },
  ],
});
