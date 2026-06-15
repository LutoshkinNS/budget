import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { queryClient } from "@/common/api/appQuery";
import { lazyDevComponent } from "@/common/lib/lazyDevComponent";
import { Notifications } from "@/common/lib/notifications";

// Import the generated route tree
import { routeTree } from "./routes/routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

const ReactQueryDevtools = lazyDevComponent(
  () => import("@tanstack/react-query-devtools"),
  (module) => module.ReactQueryDevtools,
);

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
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </Notifications>
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

export default App;
