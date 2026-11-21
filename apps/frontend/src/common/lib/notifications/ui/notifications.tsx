import { Notification } from "@/common/ui/notification/Notification.tsx";

import type { NotificationProps } from "../model/types.ts";

import s from "./notifications.module.css";

export type NotificationsProps = {
  notifications: NotificationProps[];
  onClose: (id: NotificationProps["id"]) => void;
};

export function Notifications({ notifications, onClose }: NotificationsProps) {
  return (
    <div className={s.notificationsContainer}>
      {notifications.map((notification) => (
        <Notification
          key={`${typeof notification.id}:${notification.id}`}
          variant={notification.type ?? "error"}
          onClose={() => onClose(notification.id)}
        >
          <div className={s.title}>{notification.title}</div>
          {notification.message && (
            <div className={s.message}>{notification.message}</div>
          )}
        </Notification>
      ))}
    </div>
  );
}
