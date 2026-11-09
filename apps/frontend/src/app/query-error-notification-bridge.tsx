import { useLayoutEffect } from "react";

import { subscribeToQueryErrors } from "@/common/api/query-error-notifications.ts";
import { useNotifications } from "@/common/lib/notifications";

export function QueryErrorNotificationBridge() {
  const { addNotification } = useNotifications();

  useLayoutEffect(
    () => subscribeToQueryErrors(addNotification),
    [addNotification],
  );

  return null;
}
