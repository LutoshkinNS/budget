import { CancelledError } from "@tanstack/react-query";

import type { NotificationProps } from "@/common/lib/notifications";

const fallbackMessage = "Не удалось выполнить запрос. Повторите попытку.";
const subscribers = new Set<(notification: NotificationProps) => void>();
let notificationSequence = 0;

export function publishQueryError(
  error: unknown,
  meta: Record<string, unknown> | undefined,
): void {
  if (
    meta?.queryErrorNotification === false ||
    isCancelledQueryError(error)
  ) {
    return;
  }

  const notification: NotificationProps = {
    id: `query-error-${++notificationSequence}`,
    title: readNonEmptyString(error, "code") ?? "Error",
    message: readNonEmptyString(error, "message") ?? fallbackMessage,
    deduplicateByContent: false,
  };

  for (const subscriber of subscribers) subscriber(notification);
}

export function subscribeToQueryErrors(
  subscriber: (notification: NotificationProps) => void,
): () => void {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
}

function isCancelledQueryError(error: unknown): boolean {
  return (
    error instanceof CancelledError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError")
  );
}

function readNonEmptyString(
  error: unknown,
  property: "code" | "message",
): string | undefined {
  const value = isRecord(error) ? error[property] : undefined;
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
