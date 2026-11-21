import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const requireServerDependency = createRequire(
  new URL("../../../../apps/server/package.json", import.meta.url),
);
const typescript = requireServerDependency("typescript");
const SERVER_TEST_DIRECTORY = fileURLToPath(
  new URL(
    "../../../../apps/server/src/plugins/error-handler/tests/",
    import.meta.url,
  ),
);
const OPEN_API_PATH = new URL(
  "../../generated/@typespec/openapi3/openapi.json",
  import.meta.url,
);
const HELPER_PATH = new URL(
  "../../../../apps/server/typespec-helper.ts",
  import.meta.url,
);
const VALIDATION_DEFAULT = "Некорректные параметры запроса.";

async function withHelperFixture(run, contract) {
  const directory = await mkdtemp(
    join(SERVER_TEST_DIRECTORY, "schema-fixture-"),
  );
  try {
    const serverDirectory = join(directory, "apps", "server");
    const contractDirectory = join(
      directory,
      "packages",
      "api-contracts",
      "generated",
    );
    const openApiDirectory = join(contractDirectory, "@typespec", "openapi3");
    const schemaDirectory = join(
      serverDirectory,
      "generated",
      "@typespec",
      "ts-schemas",
    );
    const runtimeDirectory = join(contractDirectory, "runtime");
    await mkdir(serverDirectory, { recursive: true });
    await mkdir(openApiDirectory, { recursive: true });
    await mkdir(schemaDirectory, { recursive: true });
    await mkdir(runtimeDirectory, { recursive: true });
    const source = await readFile(HELPER_PATH, "utf8");
    const transpiled = typescript.transpileModule(source, {
      compilerOptions: { module: typescript.ModuleKind.ES2022 },
      reportDiagnostics: true,
    });
    assert.deepEqual(transpiled.diagnostics, []);
    const helperPath = join(serverDirectory, "typespec-helper.mjs");
    await writeFile(helperPath, transpiled.outputText);
    await writeFile(
      join(openApiDirectory, "openapi.json"),
      contract
        ? JSON.stringify(contract)
        : await readFile(OPEN_API_PATH, "utf8"),
    );
    const legacyPaths = [
      join(runtimeDirectory, "error-codes.ts"),
      join(schemaDirectory, "error-codes.ts"),
    ];
    const runHelper = () =>
      spawnSync(process.execPath, [helperPath, "--generateTsSchemas"], {
        cwd: tmpdir(),
        encoding: "utf8",
      });
    await run({ schemaDirectory, legacyPaths, runHelper });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function loadGeneratedSchema(schemaDirectory, name) {
  const source = await readFile(join(schemaDirectory, `${name}.ts`), "utf8");
  const transpiled = typescript.transpileModule(source, {
    compilerOptions: { module: typescript.ModuleKind.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(transpiled.diagnostics, []);
  return (
    await import(
      `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`
    )
  ).default;
}

test("clean schema generation needs no legacy runtime catalog and preserves defaults and concrete business codes", async () => {
  await assert.rejects(
    access(new URL("../generate-error-codes.mjs", import.meta.url)),
    { code: "ENOENT" },
  );
  await withHelperFixture(
    async ({ schemaDirectory, legacyPaths, runHelper }) => {
      for (const path of legacyPaths)
        await assert.rejects(access(path), { code: "ENOENT" });
      const result = runHelper();
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr);
      const validation = await loadGeneratedSchema(
        schemaDirectory,
        "ValidationError",
      );
      assert.deepEqual(validation.properties.message, {
        type: "string",
        default: VALIDATION_DEFAULT,
      });
      assert.ok(validation.required.includes("message"));
      const unauthorized = await loadGeneratedSchema(
        schemaDirectory,
        "UnauthorizedError",
      );
      const category = await loadGeneratedSchema(
        schemaDirectory,
        "CategoryAlreadyExistsError",
      );
      assert.equal(unauthorized.required.includes("code"), false);
      assert.ok(unauthorized.required.includes("message"));
      assert.deepEqual(category.properties.code.enum, [
        "CATEGORY_ALREADY_EXISTS",
      ]);
      assert.deepEqual(category.properties.statusCode.enum, [409]);
      assert.equal(category.properties.message.type, "string");
      for (const path of legacyPaths)
        await assert.rejects(access(path), { code: "ENOENT" });
    },
  );
});

test("schema generation removes only obsolete runtime catalogs and repeats deterministically", async () => {
  await withHelperFixture(
    async ({ schemaDirectory, legacyPaths, runHelper }) => {
      for (const path of legacyPaths)
        await writeFile(path, "obsolete-runtime-content");
      const unrelatedPath = join(schemaDirectory, "unrelated-fixture.txt");
      const unrelatedContent = "unrelated-content-must-survive";
      await writeFile(unrelatedPath, unrelatedContent);
      const first = runHelper();
      assert.ifError(first.error);
      assert.equal(first.status, 0, first.stderr);
      for (const path of legacyPaths)
        await assert.rejects(access(path), { code: "ENOENT" });
      const readSchemas = async () =>
        Object.fromEntries(
          await Promise.all(
            (await readdir(schemaDirectory))
              .filter((name) => name.endsWith(".ts"))
              .sort()
              .map(async (name) => [
                name,
                await readFile(join(schemaDirectory, name), "utf8"),
              ]),
          ),
        );
      const firstSchemas = await readSchemas();
      const second = runHelper();
      assert.ifError(second.error);
      assert.equal(second.status, 0, second.stderr);
      assert.deepEqual(await readSchemas(), firstSchemas);
      assert.equal(await readFile(unrelatedPath, "utf8"), unrelatedContent);
    },
  );
});

test("server helper still propagates schema dereference failure as a nonzero process exit", async () => {
  await withHelperFixture(
    async ({ runHelper }) => {
      const result = runHelper();
      assert.ifError(result.error);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /DoesNotExist/);
    },
    {
      components: {
        schemas: { Broken: { $ref: "#/components/schemas/DoesNotExist" } },
      },
    },
  );
});

test("server helper propagates schema output write failure as a nonzero process exit", async () => {
  await withHelperFixture(async ({ schemaDirectory, runHelper }) => {
    await mkdir(join(schemaDirectory, "ValidationError.ts"));
    const result = runHelper();
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ValidationError\.ts/);
  });
});
