import React, { useContext } from "react";

import { NotificationsContextProps } from "./types.ts";

export const NotificationsContext =
  React.createContext<NotificationsContextProps | null>(null);

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) throw Error("Not found notification context");

  return context;
}
