import { NotificationUiProps } from "../../ui/notification/Notification.tsx";

export type NotificationProps = {
  id: string | number;
  title: string;
  message?: string;
  type?: NotificationUiProps["variant"];
};

export type NotificationsContextProps = {
  addNotification: (notification: NotificationProps) => void;
  deleteNotification: (id: NotificationProps["id"]) => void;
};
