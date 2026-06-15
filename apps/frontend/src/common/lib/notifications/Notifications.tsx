import React, { useState } from "react";

import { Notification } from "../../ui/notification/Notification";

import { NotificationProps } from "./types";
import { NotificationsContext } from "./useNotifications";

import s from "./notifications.module.css";

export const Notifications = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  function addNotifications(notification: NotificationProps) {
    setNotifications((prevState) => {
      if (
        prevState.some(
          (n) =>
            n.id === notification.id ||
            (n.title === notification.title &&
              n.message === notification.message),
        )
      ) {
        return prevState;
      }
      return [
        ...prevState,
        {
          ...notification,
        },
      ];
    });

    setTimeout(() => {
      deleteNotifications(notification.id);
    }, 5000);
  }

  function deleteNotifications(id: NotificationProps["id"]) {
    setNotifications((prevState) =>
      prevState.filter((notification) => notification.id !== id),
    );
  }

  return (
    <NotificationsContext.Provider
      value={{
        addNotification: addNotifications,
        deleteNotification: deleteNotifications,
      }}
    >
      {children}
      <div className={s.notificationsContainer}>
        {notifications.map((notification) => {
          return (
            <Notification
              key={notification.id}
              variant={notification.type ?? "error"}
              onClose={() => deleteNotifications(notification.id)}
            >
              <div className={s.title}>{notification.title}</div>
              {notification.message && (
                <div className={s.message}>{notification.message}</div>
              )}
            </Notification>
          );
        })}
      </div>
    </NotificationsContext.Provider>
  );
};
