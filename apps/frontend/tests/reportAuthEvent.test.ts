import { describe, expect, it } from "vitest";

import { reportAuthEvent } from "../src/modules/auth/model/reportAuthEvent.ts";

describe("reportAuthEvent", () => {
  it("sends build and runtime context without Telegram user data", async () => {
    const requests: Array<{ input: string; init?: RequestInit }> = [];
    const fetchImpl = async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      requests.push({ input: String(input), ...(init ? { init } : {}) });
      return new Response(null, { status: 200 });
    };

    await reportAuthEvent(
      "auth_callback",
      { attemptId: "attempt-123" },
      {
        buildVersion: "build-123",
        displayMode: "standalone",
        online: true,
        fetchImpl,
      },
    );

    expect(requests).toHaveLength(1);
    expect(requests[0]?.input).toBe("/api/v1/auth/client-event");
    expect(JSON.parse(String(requests[0]?.init?.body))).toEqual({
      event: "auth_callback",
      buildVersion: "build-123",
      attemptId: "attempt-123",
      displayMode: "standalone",
      online: true,
    });
  });

  it("does not reject when telemetry delivery fails", async () => {
    const fetchImpl = async () => {
      throw new Error("offline");
    };

    await expect(
      reportAuthEvent(
        "widget_script_failed",
        {},
        {
          buildVersion: "build-123",
          displayMode: "browser",
          online: false,
          fetchImpl,
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("does not reject when browser runtime APIs are unavailable", async () => {
    await expect(reportAuthEvent("page_loaded")).resolves.toBeUndefined();
  });
});
