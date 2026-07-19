import { describe, expect, it } from "vitest";

import { isModuleCommand, isPageCommand, parseArgs } from "./cli.mjs";

describe("scaffold cli", () => {
  it("parses a private page command by default", () => {
    expect(parseArgs(["frontend-page", "budgets"])).toEqual({
      command: "frontend-page",
      rawName: "budgets",
      scope: "private",
      force: false,
      dryRun: false,
      parent: null,
      title: null,
    });
  });

  it("parses a nested module command", () => {
    expect(
      parseArgs([
        "frontend-module",
        "period-summary",
        "--parent",
        "expenses",
        "--title",
        "Period Summary",
        "--dry-run",
        "--force",
      ]),
    ).toEqual({
      command: "frontend-module",
      rawName: "period-summary",
      scope: "private",
      force: true,
      dryRun: true,
      parent: "expenses",
      title: "Period Summary",
    });
  });

  it("supports equals syntax for valued options", () => {
    expect(
      parseArgs([
        "module",
        "chart-view",
        "--parent=expenses/modules/charts",
        "--title=Chart View",
      ]),
    ).toMatchObject({
      command: "module",
      rawName: "chart-view",
      parent: "expenses/modules/charts",
      title: "Chart View",
    });
  });

  it("detects command aliases", () => {
    expect(isPageCommand("page")).toBe(true);
    expect(isPageCommand("frontend-page")).toBe(true);
    expect(isModuleCommand("module")).toBe(true);
    expect(isModuleCommand("frontend-module")).toBe(true);
  });

  it("rejects missing command arguments", () => {
    expect(() => parseArgs(["frontend-page"])).toThrow("Usage:");
  });

  it("rejects conflicting page scopes", () => {
    expect(() =>
      parseArgs(["frontend-page", "budgets", "--private", "--public"]),
    ).toThrow("Choose either --private or --public");
  });

  it("rejects page-only flags for module commands", () => {
    expect(() => parseArgs(["frontend-module", "budgets", "--public"])).toThrow(
      "--public can only be used with frontend-page",
    );
  });

  it("rejects parent option for page commands", () => {
    expect(() =>
      parseArgs(["frontend-page", "budgets", "--parent", "x"]),
    ).toThrow("--parent can only be used with frontend-module");
  });

  it("rejects unknown options", () => {
    expect(() =>
      parseArgs(["frontend-module", "budgets", "--unknown"]),
    ).toThrow("Unknown option: --unknown");
  });
});
