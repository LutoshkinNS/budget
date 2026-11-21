import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";

import type { NotificationInput, NotificationProps } from "./types.ts";

const notificationLifetime = 5000;
type NotificationEntry = NotificationProps & { deadline: number };

type NotificationAction =
  | { type: "add"; input: NotificationInput; now: number }
  | { type: "delete"; id: NotificationProps["id"] }
  | { type: "expire"; now: number };

type NotificationState = {
  notifications: NotificationEntry[];
  nextGeneratedId: number;
};

function reduceNotifications(
  state: NotificationState,
  action: NotificationAction,
): NotificationState {
  switch (action.type) {
    case "add": {
      let id = action.input.id;
      let nextGeneratedId = state.nextGeneratedId;
      if (id === undefined) {
        do {
          id = `notification-${++nextGeneratedId}`;
        } while (
          state.notifications.some((notification) => notification.id === id)
        );
      }
      if (state.notifications.some((notification) => notification.id === id)) {
        return state;
      }

      return {
        nextGeneratedId,
        notifications: [
          ...state.notifications,
          {
            ...action.input,
            id,
            deadline: action.now + notificationLifetime,
          },
        ],
      };
    }
    case "delete":
      return {
        ...state,
        notifications: state.notifications.filter(({ id }) => id !== action.id),
      };
    case "expire":
      return {
        ...state,
        notifications: state.notifications.filter(
          ({ deadline }) => deadline > action.now,
        ),
      };
  }
}

export function useNotificationsModel() {
  const [{ notifications }, dispatch] = useReducer(reduceNotifications, {
    notifications: [],
    nextGeneratedId: 0,
  });
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const deleteNotification = useCallback((id: NotificationProps["id"]) => {
    if (!isMounted.current) return;
    dispatch({ type: "delete", id });
  }, []);

  const addNotification = useCallback((input: NotificationInput) => {
    if (!isMounted.current) return;
    dispatch({ type: "add", input, now: Date.now() });
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;

    const nextDeadline = Math.min(
      ...notifications.map(({ deadline }) => deadline),
    );
    const timeout = window.setTimeout(
      () => {
        const now = Date.now();
        dispatch({ type: "expire", now });
      },
      Math.max(0, nextDeadline - Date.now()),
    );

    return () => window.clearTimeout(timeout);
  }, [notifications]);

  return { notifications, addNotification, deleteNotification };
}
