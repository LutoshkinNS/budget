export type NotificationProps = {
  id: string | number;
  title: string;
  message?: string;
  type?: "success" | "error";
};

export type NotificationInput = Omit<NotificationProps, "id"> & {
  id?: NotificationProps["id"];
};

export type NotificationsContextValue = {
  notifications: NotificationProps[];
  addNotification: (input: NotificationInput) => void;
  deleteNotification: (id: NotificationProps["id"]) => void;
};
