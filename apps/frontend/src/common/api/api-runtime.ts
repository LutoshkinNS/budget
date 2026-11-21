import type { QueryClient } from "@tanstack/react-query";
import type { z } from "zod";

import type { ApiError } from "./api-error.ts";
import type {
  ApiObserver,
  ApiOperation,
  ApiRequestMethod,
} from "./api-observation.ts";
import { safeObserve } from "./api-observation.ts";
import { createAppQueryClient } from "./app-query.ts";
import { createRefreshState, createRequestCore } from "./request-validated.ts";

export type ApiTransport = {
  requestValidated<S extends z.ZodType>(
    url: string,
    options: {
      method: ApiRequestMethod;
      operation: ApiOperation;
    } & Omit<RequestInit, "method">,
    schema: S,
  ): Promise<z.output<S>>;
};

export type ApiRuntime = {
  transport: ApiTransport;
  queryClient: QueryClient;
  dispose(): void;
};

export type ApiRuntimeDependencies = {
  fetch: typeof globalThis.fetch;
  observe?: ApiObserver;
  notifyError: (feedback: { title: string; message: string }) => void;
};

export function createApiRuntime({
  fetch,
  observe,
  notifyError,
}: ApiRuntimeDependencies): ApiRuntime {
  let isDisposed = false;
  const runtimeObserver: ApiObserver = (event) => {
    if (!isDisposed) safeObserve(observe, event);
  };
  const requestCore = createRequestCore({
    fetch,
    observe: runtimeObserver,
    refreshState: createRefreshState(),
  });
  const queryClient = createAppQueryClient({
    observe: runtimeObserver,
    onQueryError: (error) => {
      if (isDisposed) return;
      notifyError(getErrorFeedback(error));
    },
  });

  return {
    transport: {
      requestValidated: (url, options, schema) =>
        requestCore.requestValidated(url, options, schema),
    },
    queryClient,
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      void queryClient.cancelQueries();
    },
  };
}

function getErrorFeedback(error: ApiError) {
  return {
    title: "Не удалось выполнить запрос",
    message: error.message,
  };
}
