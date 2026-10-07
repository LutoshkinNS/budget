import { test as base } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type BackendFixture = { url: string; legacyId: number };

export const test = base.extend<
  Record<string, never>,
  { categoryBackend: BackendFixture }
>({
  categoryBackend: [
    async ({ playwright: _playwright }, use) => {
      const serverRoot = resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../../../server",
      );
      const directory = mkdtempSync(join(tmpdir(), "budget-icons-e2e-"));
      const child = spawn(
        process.execPath,
        [
          join(serverRoot, "node_modules/tsx/dist/cli.mjs"),
          fileURLToPath(
            new URL("./category-icons-server.mts", import.meta.url),
          ),
        ],
        {
          cwd: serverRoot,
          env: {
            ...process.env,
            DATABASE_URL:
              "file:" + join(directory, "test.db").split("\\").join("/"),
            PORT: "0",
            JWT_SECRET: "category-icons-e2e-isolated-secret",
            FRONTEND_URL: "http://127.0.0.1:3001",
            NODE_ENV: "test",
            TELEGRAM_BOT_TOKEN: "category-icons-e2e-token",
            CATEGORY_ICONS_TEST_DIRECTORY: directory,
            CATEGORY_ICONS_SERVER_ROOT: serverRoot,
          },
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true,
        },
      );
      let output = "";
      try {
        const backend = await new Promise<BackendFixture>(
          (resolveReady, reject) => {
            const timer = setTimeout(
              () => reject(new Error("Backend startup timed out: " + output)),
              45000,
            );
            const acceptOutput = (chunk: Buffer) => {
              output += chunk.toString();
              const ready = output.match(/CATEGORY_ICONS_READY=(\{[^\n]+\})/);
              if (ready?.[1]) {
                const value: unknown = JSON.parse(ready[1]);
                if (
                  typeof value === "object" &&
                  value !== null &&
                  "url" in value &&
                  typeof value.url === "string" &&
                  "legacyId" in value &&
                  typeof value.legacyId === "number"
                ) {
                  clearTimeout(timer);
                  resolveReady({ url: value.url, legacyId: value.legacyId });
                }
              }
            };
            child.stdout.on("data", acceptOutput);
            child.stderr.on("data", acceptOutput);
            child.once("error", (error) => {
              clearTimeout(timer);
              reject(error);
            });
            child.once("exit", (code) => {
              clearTimeout(timer);
              reject(new Error("Backend exited " + code + ": " + output));
            });
          },
        );
        await use(backend);
      } finally {
        if (child.exitCode === null) {
          const exited = new Promise<void>((resolveExit) =>
            child.once("exit", () => resolveExit()),
          );
          child.stdin.write("stop\n");
          const timer = setTimeout(() => child.kill(), 5000);
          await exited;
          clearTimeout(timer);
        }
        // Каталог создан fixture; никогда не удаляем пользовательскую БД.
        if (directory.startsWith(join(tmpdir(), "budget-icons-e2e-")))
          rmSync(directory, { recursive: true, force: true });
      }
    },
    { scope: "worker", timeout: 60000 },
  ],
});
