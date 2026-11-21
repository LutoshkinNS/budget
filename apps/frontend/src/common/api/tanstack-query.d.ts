import "@tanstack/react-query";

import type { ApiOperation } from "./api-observation.ts";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: unknown;
    queryMeta: Record<string, unknown> & {
      queryErrorNotification?: false;
      operation?: ApiOperation;
    };
  }
}
