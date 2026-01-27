import { defineConfig } from "orval";

const openapiPath =
  process.env.OPENAPI_PATH ||
  "../server/generated/@typespec/openapi3/openapi.json";

export default defineConfig({
  budget: {
    input: openapiPath,
    output: {
      mode: "tags-split",
      target: "src/kernel/api/generate",
      schemas: "src/kernel/api/generate/model",
      fileExtension: ".gen.ts",
      client: "react-query",
      mock: false,
      prettier: true,
      propertySortOrder: "Alphabetical",
      override: {
        mutator: {
          path: "./src/kernel/api/fetcher.ts",
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
      target: "src/kernel/api/generate",
      fileExtension: ".zod.gen.ts",
      prettier: true,
    },
  },
});
