export type AuthClientEventName =
  | "page_loaded"
  | "widget_script_loaded"
  | "widget_script_failed"
  | "auth_callback"
  | "login_started"
  | "login_succeeded"
  | "login_failed"
  | "session_confirmed";

type AuthEventOptions = {
  attemptId?: string;
};

type AuthEventDependencies = {
  buildVersion: string;
  displayMode: string;
  online: boolean;
  fetchImpl: typeof fetch;
};

function getDefaultDependencies(): AuthEventDependencies | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  return {
    buildVersion: import.meta.env.VITE_APP_VERSION || "dev",
    displayMode: window.matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : "browser",
    online: navigator.onLine,
    fetchImpl: window.fetch.bind(window),
  };
}

export async function reportAuthEvent(
  event: AuthClientEventName,
  options: AuthEventOptions = {},
  dependencies?: AuthEventDependencies,
) {
  try {
    const runtime = dependencies ?? getDefaultDependencies();
    if (!runtime) return;

    const payload = {
      event,
      buildVersion: runtime.buildVersion,
      ...(options.attemptId ? { attemptId: options.attemptId } : {}),
      displayMode: runtime.displayMode,
      online: runtime.online,
    };

    await runtime.fetchImpl("/api/v1/auth/client-event", {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Telemetry must never affect authentication.
  }
}
