import type { PropsWithChildren } from "react";

import { Notifications, NotificationsProvider, useNotifications } from "..";

export function NotificationTestView() {
  const { notifications, deleteNotification } = useNotifications();
  return (
    <Notifications notifications={notifications} onClose={deleteNotification} />
  );
}

export function NotificationsTestRoot({ children }: PropsWithChildren) {
  return (
    <NotificationsProvider>
      {children}
      <NotificationTestView />
    </NotificationsProvider>
  );
}
