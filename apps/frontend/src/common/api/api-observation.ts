export type ApiOperation =
  | "categoriesList"
  | "authRefresh"
  | "unknown-operation";

export type ApiHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "unknown-method";

export type ApiRequestMethod = Exclude<ApiHttpMethod, "unknown-method">;

export type ApiHttpOutcome =
  | "success"
  | "http-error"
  | "network-error"
  | "cancelled"
  | "body-error";

export type ApiObservation =
  | {
      runtime: "frontend";
      event: "http-completed";
      operation: ApiOperation;
      method: ApiHttpMethod;
      outcome: ApiHttpOutcome;
      status?: number;
      durationMs: number;
    }
  | {
      runtime: "frontend";
      event: "response-invalid";
      operation: ApiOperation;
      reason: "invalid-json" | "schema-mismatch";
      status: number;
    }
  | {
      runtime: "frontend";
      event: "query-completed";
      operation: ApiOperation;
      result: "success" | "error" | "cancelled";
    };

export type ApiObserver = (event: ApiObservation) => void | Promise<void>;

export function safeObserve(
  observe: ApiObserver | undefined,
  event: ApiObservation,
): void {
  if (!observe) return;

  try {
    const result = observe(event);
    if (result && typeof result.then === "function") {
      void result.catch(() => undefined);
    }
  } catch {
    // Observer — best-effort канал; его сбой не должен влиять на запрос.
  }
}
