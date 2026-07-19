import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  getModuleDir,
  getParentModuleSegments,
  getRouteDir,
} from "./paths.mjs";

describe("scaffold paths", () => {
  const frontendRoot = path.join("repo", "apps", "frontend");

  it("returns no parent segments for a top-level module", () => {
    expect(getParentModuleSegments(null)).toEqual([]);
  });

  it("normalizes parent module paths", () => {
    expect(getParentModuleSegments("Expenses\\modules\\Charts")).toEqual([
      "expenses",
      "modules",
      "charts",
    ]);
  });

  it("rejects absolute parent paths", () => {
    expect(() => getParentModuleSegments(path.resolve("expenses"))).toThrow(
      "--parent must be relative to src/modules",
    );
  });

  it("rejects invalid parent path segments", () => {
    expect(() => getParentModuleSegments("expenses/../charts")).toThrow(
      "Parent module path segment name must resolve to kebab-case",
    );
  });

  it("builds top-level module paths", () => {
    expect(getModuleDir(frontendRoot, null, "budgets")).toBe(
      path.join(frontendRoot, "src/modules", "budgets"),
    );
  });

  it("builds nested module paths", () => {
    expect(
      getModuleDir(frontendRoot, "expenses/modules/charts", "cash-flow"),
    ).toBe(
      path.join(
        frontendRoot,
        "src/modules",
        "expenses",
        "modules",
        "charts",
        "modules",
        "cash-flow",
      ),
    );
  });

  it("builds scoped route directories", () => {
    expect(getRouteDir(frontendRoot, "public")).toBe(
      path.join(frontendRoot, "src/app/routes", "_public"),
    );
    expect(getRouteDir(frontendRoot, "private")).toBe(
      path.join(frontendRoot, "src/app/routes", "_private"),
    );
  });
});
