import { Suspense } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { lazyDevComponent } from "@/common/lib/lazyDevComponent";
import { NotificationsProvider } from "@/common/lib/notifications";

import { routeTree } from "./routes/routeTree.gen";
import { QueryProvider } from "./query-provider.tsx";

const router = createRouter({ routeTree });

const ReactQueryDevtools = lazyDevComponent(
  () => import("@tanstack/react-query-devtools"),
  (module) => module.ReactQueryDevtools,
);

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <NotificationsProvider>
      <QueryProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools />
          </Suspense>
        )}
      </QueryProvider>
    </NotificationsProvider>
  );
}

export default App;
