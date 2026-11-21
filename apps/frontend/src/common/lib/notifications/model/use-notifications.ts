import { createContext, useContext } from "react";

import type { NotificationsContextValue } from "./types.ts";

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("NotificationsProvider is missing");
  return context;
}

export { NotificationsContext };
