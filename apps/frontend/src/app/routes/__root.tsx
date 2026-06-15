import { Suspense } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";

import { lazyDevComponent } from "@/common/lib/lazyDevComponent";

const TanStackRouterDevtools = lazyDevComponent(
  () => import("@tanstack/react-router-devtools"),
  (module) => module.TanStackRouterDevtools,
);

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {TanStackRouterDevtools && (
        <Suspense fallback={null}>
          <TanStackRouterDevtools />
        </Suspense>
      )}
    </>
  ),
});
