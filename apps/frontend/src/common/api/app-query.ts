import { QueryCache, QueryClient } from "@tanstack/react-query";

import { publishQueryError } from "./query-error-notifications.ts";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      publishQueryError(error, query.meta);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        if (error?.statusCode >= 500) return failureCount < 3;
        return false;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
