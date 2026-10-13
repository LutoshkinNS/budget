import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type Backend = { url: string };

export function parseBackend(value: unknown): Backend {
  if (
    typeof value !== "object" ||
    value === null ||
    !("url" in value) ||
    typeof value.url !== "string"
  )
    throw new Error("Invalid backend readiness response");
  return { url: value.url };
}

export async function withIsolatedBackend<T extends Backend>(
  entrypoint: URL,
  parseReady: (value: unknown) => T,
  provideBackend: (backend: T) => Promise<void>,
) {
  const serverRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../server",
  );
  const directory = mkdtempSync(join(tmpdir(), "budget-e2e-"));
  const child = spawn(
    process.execPath,
    [
      join(serverRoot, "node_modules/tsx/dist/cli.mjs"),
      fileURLToPath(entrypoint),
    ],
    {
      cwd: serverRoot,
      env: {
        ...process.env,
        DATABASE_URL:
          "file:" + join(directory, "test.db").split("\\").join("/"),
        PORT: "0",
        JWT_SECRET: "budget-e2e-isolated-secret",
        FRONTEND_URL: "http://127.0.0.1:3001",
        NODE_ENV: "test",
        TELEGRAM_BOT_TOKEN: "budget-e2e-token",
        E2E_TEST_DIRECTORY: directory,
        E2E_SERVER_ROOT: serverRoot,
      },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  let output = "";
  try {
    const backend = await new Promise<T>((resolveReady, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Backend startup timed out: " + output)),
        45000,
      );
      const acceptOutput = (chunk: Buffer) => {
        output += chunk.toString();
        const ready = output.match(/E2E_BACKEND_READY=(\{[^\n]+\})/);
        if (ready?.[1]) {
          clearTimeout(timer);
          try {
            resolveReady(parseReady(JSON.parse(ready[1])));
          } catch (error) {
            reject(error);
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
    });
    await provideBackend(backend);
  } finally {
    if (
      child.pid !== undefined &&
      child.exitCode === null &&
      child.signalCode === null
    ) {
      const exited = new Promise<void>((resolveExit) =>
        child.once("exit", () => resolveExit()),
      );
      child.stdin.write("stop\n");
      const timer = setTimeout(() => child.kill(), 5000);
      await exited;
      clearTimeout(timer);
    }
    // Каталог создан fixture; никогда не удаляем пользовательскую БД.
    const cleanupTarget = resolve(directory);
    if (
      dirname(cleanupTarget) === resolve(tmpdir()) &&
      cleanupTarget.startsWith(join(resolve(tmpdir()), "budget-e2e-"))
    )
      rmSync(cleanupTarget, { recursive: true, force: true });
  }
}
