import type { PropsWithChildren } from "react";

import { NotificationsProvider } from "@/common/lib/notifications";

import { QueryProvider } from "../query-provider";

export function QueryTestRoot({ children }: PropsWithChildren) {
  return (
    <NotificationsProvider>
      <QueryProvider>{children}</QueryProvider>
    </NotificationsProvider>
  );
}
