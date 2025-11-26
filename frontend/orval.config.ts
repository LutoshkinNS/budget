import { defineConfig } from "orval";

export default defineConfig({
  budget: {
    input: "../server/generated/@typespec/openapi3/openapi.json",
    output: {
      mode: "tags-split",
      target: "src/kernel/api/generate/budget.ts",
      schemas: "src/model",
      client: "react-query",
      mock: false,
      // override: {
      //   mutator: {
      //     path: "src/kernel/api/client.ts",
      //     name: "customFetch",
      //   },
      // },
    },
  },
});
