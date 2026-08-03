import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "orval";

const frontendDir = dirname(fileURLToPath(import.meta.url));

const openapiPath =
  process.env.OPENAPI_PATH ||
  "../../packages/api-contracts/generated/@typespec/openapi3/openapi.json";

const modelDir = join(frontendDir, "src/common/api/generate/model");

const syncModelImportProxies = () => {
  const generatedModelFiles = readdirSync(modelDir).filter((fileName) =>
    fileName.endsWith(".gen.ts"),
  );
  const generatedModelNames = new Set(
    generatedModelFiles.map((fileName) => fileName.replace(/\.gen\.ts$/, "")),
  );
  const importedModelNames = new Set<string>();
  const importPattern = /from "\.\/([^"]+)";/g;
  const proxyFiles = readdirSync(modelDir).filter(
    (fileName) => fileName.endsWith(".ts") && !fileName.endsWith(".gen.ts"),
  );

  for (const fileName of generatedModelFiles) {
    const source = readFileSync(join(modelDir, fileName), "utf8");
    const matches = source.matchAll(importPattern);

    for (const match of matches) {
      const importName = match[1];

      if (
        importName &&
        !importName.includes(".") &&
        generatedModelNames.has(importName)
      ) {
        importedModelNames.add(importName);
      }
    }
  }

  for (const fileName of proxyFiles) {
    const modelName = fileName.replace(/\.ts$/, "");

    if (!generatedModelNames.has(modelName)) {
      unlinkSync(join(modelDir, fileName));
    }
  }

  for (const modelName of [...importedModelNames].sort()) {
    const proxyPath = join(modelDir, `${modelName}.ts`);
    const proxySource = `export * from "./${modelName}.gen.ts";\n`;

    if (
      !existsSync(proxyPath) ||
      readFileSync(proxyPath, "utf8") !== proxySource
    ) {
      writeFileSync(proxyPath, proxySource);
    }
  }
};

export default defineConfig({
  budget: {
    input: openapiPath,
    hooks: {
      afterAllFilesWrite: syncModelImportProxies,
    },
    output: {
      mode: "tags-split",
      target: "src/common/api/generate",
      schemas: "src/common/api/generate/model",
      fileExtension: ".gen.ts",
      client: "react-query",
      mock: false,
      prettier: true,
      propertySortOrder: "Alphabetical",
      override: {
        mutator: {
          path: "./src/common/api/fetcher.ts",
          name: "fetcher",
        },
        query: {
          useInvalidate: true,
          shouldSplitQueryKey: true,
          useOperationIdAsQueryKey: true,
        },
        components: {
          schemas: {
            suffix: "DTO",
          },
        },
        enumGenerationType: "union",
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
  budgetZod: {
    input: openapiPath,
    output: {
      mode: "tags-split",
      client: "zod",
      target: "src/common/api/generate",
      fileExtension: ".zod.gen.ts",
      prettier: true,
    },
  },
});
