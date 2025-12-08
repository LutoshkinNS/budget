import { defineConfig } from "orval";

export default defineConfig({
  budget: {
    input: "../server/generated/@typespec/openapi3/openapi.json",
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
          path: "./src/kernel/api/customFetcher.ts",
          name: "customFetcher",
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
    input: "../server/generated/@typespec/openapi3/openapi.json",
    output: {
      mode: "tags-split",
      client: "zod",
      target: "src/kernel/api/generate",
      fileExtension: ".zod.gen.ts",
      prettier: true,
    },
  },
});
