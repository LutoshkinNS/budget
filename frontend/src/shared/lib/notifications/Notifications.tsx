import React, { useState } from "react";

import { NotificationProps } from "./types";
import { NotificationsContext } from "./useNotifications";

export const Notifications = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  function addNotifications(notification: NotificationProps) {
    setNotifications((prevState) => {
      if (prevState.some((n) => n.id === notification.id)) {
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
      <div style={{ position: "fixed", bottom: "100px", left: "100px" }}>
        {notifications.map((notification) => {
          return (
            <p key={notification.id}>
              <b>{notification.title}</b>
              {notification.message ? `: ${notification.message}` : null}
            </p>
          );
        })}
      </div>
    </NotificationsContext.Provider>
  );
};
