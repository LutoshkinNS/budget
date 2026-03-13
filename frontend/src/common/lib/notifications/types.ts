export type NotificationProps = {
  id: string | number;
  title: string;
  message?: string;
};

export type NotificationsContextProps = {
  addNotification: (notification: NotificationProps) => void;
  deleteNotification: (id: NotificationProps["id"]) => void;
};
