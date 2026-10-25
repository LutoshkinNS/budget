import { afterEach, describe, expect, it, vi } from "vitest";

import { fetcher } from "../fetcher.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetcher 401 retry", () => {
  it("retries the original account-scoped URL after a delayed refresh", async () => {
    const calls: string[] = [];
    let resolveRefresh: ((response: Response) => void) | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
        const url = String(input);
        calls.push(url);

        if (url === "/api/v1/auth/refresh") {
          return new Promise<Response>((resolve) => {
            resolveRefresh = resolve;
          });
        }

        const attempts = calls.filter((call) => call === url).length;
        if (attempts === 1) {
          return Response.json({ statusCode: 401 }, { status: 401 });
        }
        return Response.json([{ id: 1 }]);
      }),
    );

    const requestUrl = "/api/v1/accounts/42/transactions?from=2026-10-01";
    const pending = fetcher<Array<{ id: number }>>(requestUrl);
    await vi.waitFor(() => expect(calls).toContain("/api/v1/auth/refresh"));

    resolveRefresh?.(Response.json({ success: true }));
    expect(await pending).toEqual([{ id: 1 }]);

    expect(calls).toEqual([
      requestUrl,
      "/api/v1/auth/refresh",
      requestUrl,
    ]);
  });
});
