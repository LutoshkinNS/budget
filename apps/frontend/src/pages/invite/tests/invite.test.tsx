import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Notifications } from "@/common/lib/notifications";
import { INVITE_CODE_KEY } from "@/modules/auth";

import { Invite } from "..";

const fetchMock = vi.fn<typeof fetch>();
let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  sessionStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  client.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("invitation login continuation", () => {
  it("stores the current route code before navigating to login", async () => {
    const unauthorized = () =>
      Response.json({ statusCode: 401, code: "UNAUTHORIZED" }, { status: 401 });
    fetchMock.mockImplementation(async () => unauthorized());
    const navigateHome = vi.fn();
    const navigateToLogin = vi.fn(() => {
      expect(sessionStorage.getItem(INVITE_CODE_KEY)).toBe("current-code");
    });
    render(
      <QueryClientProvider client={client}>
        <Notifications>
          <Invite
            code="current-code"
            navigateHome={navigateHome}
            navigateToLogin={navigateToLogin}
          />
        </Notifications>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(navigateToLogin).toHaveBeenCalledTimes(1));
    expect(navigateHome).not.toHaveBeenCalled();
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("invitations/redeem"),
      ),
    ).toBe(false);
  });
});
