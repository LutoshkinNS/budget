import type { ReactNode } from "react";

import { NotificationsContext } from "./use-notifications.ts";
import { useNotificationsModel } from "./use-notifications-model.ts";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const notifications = useNotificationsModel();

  return (
    <NotificationsContext.Provider value={notifications}>
      {children}
    </NotificationsContext.Provider>
  );
}
