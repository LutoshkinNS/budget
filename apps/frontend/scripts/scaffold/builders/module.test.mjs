import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildFrontendModuleFiles } from "./module.mjs";

describe("frontend module scaffold builder", () => {
  it("creates the module public boundary and nested module guide", () => {
    const files = buildFrontendModuleFiles({
      rawName: "cash-flow",
      parent: "expenses",
      title: "Cash Flow",
    });
    const paths = files.map((file) => file.path);

    expect(paths).toContain(
      path.join(
        process.cwd(),
        "src/modules/expenses/modules/cash-flow/index.ts",
      ),
    );
    expect(paths).toContain(
      path.join(
        process.cwd(),
        "src/modules/expenses/modules/cash-flow/modules/README.md",
      ),
    );
    const nestedModuleGuide = files.find((file) =>
      file.path.endsWith(path.join("modules", "README.md")),
    );

    expect(nestedModuleGuide?.content).toContain(
      "Use this directory when Cash Flow grows an internal capability",
    );
  });
});
