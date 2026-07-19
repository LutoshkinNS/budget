import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { writeFiles } from "./writer.mjs";

describe("scaffold writer", () => {
  let tempDir;
  let logSpy;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "budget-scaffold-"));
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    logSpy.mockRestore();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("prints dry-run creates without writing files", async () => {
    const filePath = path.join(tempDir, "src/modules/budgets/index.ts");

    await writeFiles([{ path: filePath, content: "export {};\n" }], {
      dryRun: true,
      force: false,
    });

    await expect(fs.access(filePath)).rejects.toThrow();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Would create"),
    );
  });

  it("prints dry-run keeps for existing files", async () => {
    const filePath = path.join(tempDir, "src/modules/budgets/index.ts");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "existing\n", "utf8");

    await writeFiles([{ path: filePath, content: "replacement\n" }], {
      dryRun: true,
      force: false,
    });

    await expect(fs.readFile(filePath, "utf8")).resolves.toBe("existing\n");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Would keep"));
  });

  it("refuses to overwrite existing files without force", async () => {
    const filePath = path.join(tempDir, "src/modules/budgets/index.ts");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "existing\n", "utf8");

    await expect(
      writeFiles([{ path: filePath, content: "replacement\n" }], {
        dryRun: false,
        force: false,
      }),
    ).rejects.toThrow("Refusing to overwrite existing files");
  });

  it("overwrites existing files with force", async () => {
    const filePath = path.join(tempDir, "src/modules/budgets/index.ts");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "existing\n", "utf8");

    await writeFiles([{ path: filePath, content: "replacement\n" }], {
      dryRun: false,
      force: true,
    });

    await expect(fs.readFile(filePath, "utf8")).resolves.toBe("replacement\n");
  });
});
