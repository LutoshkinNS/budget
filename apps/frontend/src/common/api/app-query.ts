import { CancelledError, QueryCache, QueryClient } from "@tanstack/react-query";

import type { ApiError } from "./api-error.ts";
import {
  isApiError,
  isCancellationError,
  normalizeApiError,
} from "./api-error.ts";
import type { ApiObserver, ApiOperation } from "./api-observation.ts";
import { safeObserve } from "./api-observation.ts";

type AppQueryOptions = {
  onQueryError: (error: ApiError) => void;
  observe?: ApiObserver;
};

export function createAppQueryClient(
  onQueryError: ((error: ApiError) => void) | AppQueryOptions,
): QueryClient {
  const options =
    typeof onQueryError === "function" ? { onQueryError } : onQueryError;

  return new QueryClient({
    queryCache: new QueryCache({
      onSuccess: (_data, query) => {
        safeObserve(options.observe, {
          runtime: "frontend",
          event: "query-completed",
          operation: getOperation(query.meta?.operation),
          result: "success",
        });
      },
      onError: (error, query) => {
        const cancelled = isCancelledQueryError(error);
        safeObserve(options.observe, {
          runtime: "frontend",
          event: "query-completed",
          operation: getOperation(query.meta?.operation),
          result: cancelled ? "cancelled" : "error",
        });

        if (
          query.state.data === undefined ||
          query.meta?.queryErrorNotification === false ||
          cancelled
        ) {
          return;
        }

        options.onQueryError(normalizeApiError(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        retry: (failureCount, error) =>
          getHttpStatus(error) >= 500 && failureCount < 3,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function getOperation(value: unknown): ApiOperation {
  return value === "categoriesList" || value === "authRefresh"
    ? value
    : "unknown-operation";
}

function getHttpStatus(error: unknown): number {
  if (isApiError(error)) return error.statusCode;
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }
  return 0;
}

function isCancelledQueryError(error: unknown): boolean {
  return error instanceof CancelledError || isCancellationError(error);
}
