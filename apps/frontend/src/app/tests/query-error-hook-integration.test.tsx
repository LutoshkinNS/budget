import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { Notifications } from "@/common/lib/notifications";
import { InvitationRedemption, useAccounts } from "@/modules/accounts";
import { useSubcategories } from "@/modules/subcategories";
import { getSessionContext, useMe } from "@/modules/user";

import { QueryErrorNotificationBridge } from "../query-error-notification-bridge";

const profile = {
  userId: 1,
  accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
};
const errorPayload = {
  statusCode: 400,
  code: "HTTP_FAILURE",
  message: "Ошибка загрузки",
};
const fetchMock = vi.fn<typeof fetch>();

function wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <Notifications>
        <QueryErrorNotificationBridge />
        {children}
      </Notifications>
    </QueryClientProvider>
  );
}

function seedProfile() {
  const session = getSessionContext(queryClient);
  const token = session.captureRead();
  if (!token) throw new Error("Fixture session is pending");
  session.apply(token, { type: "me-valid", actorId: 1 });
  queryClient.setQueryData(getAuthMeQueryKey(), profile);
}

beforeEach(() => {
  queryClient.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("domain hooks use the global notification owner", () => {
  it("reports one accounts query failure for two hook consumers and preserves successful-response validation", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(errorPayload, { status: 400 }),
    );
    const { result } = renderHook(() => [useAccounts(), useAccounts()], {
      wrapper,
    });
    await waitFor(() =>
      expect(screen.getAllByText("HTTP_FAILURE")).toHaveLength(1),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current[0]?.data).toEqual([]);
    expect(result.current[0]?.isError).toBe(true);
    expect(result.current[0]?.error).toEqual(errorPayload);
    fetchMock.mockResolvedValueOnce(Response.json([{ id: 7 }]));
    await act(async () => {
      await result.current[0]?.refetch();
    });
    await waitFor(() =>
      expect(screen.getAllByText("Некорректные данные")).toHaveLength(1),
    );
    expect(screen.getAllByText("HTTP_FAILURE")).toHaveLength(1);
    expect(result.current[0]?.data).toEqual([{ id: 7 }]);
    expect(result.current[0]?.isError).toBe(false);
  });

  it("reports one scoped subcategories failure and preserves malformed-success validation and empty return", async () => {
    seedProfile();
    fetchMock.mockResolvedValueOnce(
      Response.json(errorPayload, { status: 400 }),
    );
    const { result } = renderHook(
      () => [useSubcategories(3), useSubcategories(3)],
      { wrapper },
    );
    await waitFor(() =>
      expect(screen.getAllByText("HTTP_FAILURE")).toHaveLength(1),
    );
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/v1/accounts/42/categories/3/subcategories",
    ]);
    expect(result.current[0]?.data).toEqual([]);
    fetchMock.mockResolvedValueOnce(Response.json([{ id: 7 }]));
    await act(async () => {
      await queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey !== getAuthMeQueryKey() &&
          query.queryKey.includes("subcategories"),
      });
    });
    await waitFor(() =>
      expect(screen.getAllByText("Некорректные данные")).toHaveLength(1),
    );
    expect(screen.getAllByText("HTTP_FAILURE")).toHaveLength(1);
    expect(result.current[0]?.data).toEqual([]);
  });

  it.each([401, 500, 0])(
    "leaves useMe status %s to its own session UX and allows explicit retry",
    async (statusCode) => {
      const respond = () =>
        statusCode === 0
          ? Promise.reject(new TypeError("Offline"))
          : Promise.resolve(
              Response.json(
                { ...errorPayload, statusCode },
                { status: statusCode },
              ),
            );
      fetchMock.mockImplementation(respond);
      const { result } = renderHook(useMe, { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.isUnauthorized).toBe(statusCode === 401);
      expect(result.current.hasValidData).toBe(false);
      expect(screen.queryByRole("button", { name: "×" })).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(statusCode === 401 ? 2 : 1);
      fetchMock.mockResolvedValue(Response.json(profile));
      await act(async () => {
        await result.current.refetch();
      });
      await waitFor(() => expect(result.current.data).toEqual(profile));
      expect(screen.queryByRole("button", { name: "×" })).toBeNull();
    },
  );

  it("keeps an invitation profile-refresh failure inline without adding a generic toast", async () => {
    seedProfile();
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith("/invitations/redeem"))
        return Response.json({
          id: 1,
          code: "code-a",
          accountId: 43,
          expiresAt: "2030-01-01T00:00:00.000Z",
        });
      if (String(url).endsWith("/auth/me"))
        return Response.json(
          { ...errorPayload, statusCode: 500 },
          { status: 500 },
        );
      throw new Error(`Unexpected HTTP: ${String(url)}`);
    });
    render(
      <InvitationRedemption
        code="code-a"
        onRedeemed={vi.fn()}
        onAuthenticationRequired={vi.fn()}
      />,
      { wrapper },
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Повторить/ })).toBeTruthy(),
    );
    expect(screen.queryByRole("button", { name: "×" })).toBeNull();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/me")),
    ).toHaveLength(1);
  });
});
