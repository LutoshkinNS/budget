import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
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
