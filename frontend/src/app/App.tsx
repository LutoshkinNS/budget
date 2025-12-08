import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { Notifications } from "@/shared/lib/notifications";

import { queryClient } from "../kernel/api/appQuery";

// Import the generated route tree
import { routeTree } from "./routes/routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Notifications>
        <RouterProvider router={router} />
      </Notifications>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
