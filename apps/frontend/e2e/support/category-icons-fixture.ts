import { test as base } from "@playwright/test";

import {
  type Backend,
  parseBackend,
  withIsolatedBackend,
} from "./isolated-backend";

type CategoryIconsBackend = Backend & { legacyId: number };

function parseCategoryIconsBackend(value: unknown): CategoryIconsBackend {
  const backend = parseBackend(value);
  if (
    typeof value !== "object" ||
    value === null ||
    !("legacyId" in value) ||
    typeof value.legacyId !== "number"
  )
    throw new Error("Missing legacy category ID");
  return { ...backend, legacyId: value.legacyId };
}

export const test = base.extend<
  Record<never, never>,
  { categoryBackend: CategoryIconsBackend }
>({
  categoryBackend: [
    async ({ playwright: _playwright }, use) => {
      await withIsolatedBackend(
        new URL("./category-icons-server.mts", import.meta.url),
        parseCategoryIconsBackend,
        use,
      );
    },
    { scope: "worker", timeout: 60000 },
  ],
});
