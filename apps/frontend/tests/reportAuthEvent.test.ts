import assert from "node:assert/strict";
import { describe, it } from "node:test";

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

    assert.equal(requests.length, 1);
    assert.equal(requests[0]?.input, "/api/v1/auth/client-event");
    assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
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

    await assert.doesNotReject(() =>
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
    );
  });

  it("does not reject when browser runtime APIs are unavailable", async () => {
    await assert.doesNotReject(() => reportAuthEvent("page_loaded"));
  });
});
