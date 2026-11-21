import { useQueryClient } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/common/api/api-error";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { InvitationRedemption, useAccounts } from "@/modules/accounts";
import { useSubcategories } from "@/modules/subcategories";
import { getSessionContext, useMe } from "@/modules/user";

import { mountQueryTestRoot } from "./mount-query-test-root";
import { QueryTestRoot } from "./query-test-root";

const profile = {
  userId: 1,
  accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
};
const errorPayload = {
  statusCode: 400,
  message: "Ошибка загрузки",
};
const fetchMock = vi.fn<typeof fetch>();
const clients: ReturnType<typeof mountQueryTestRoot>["client"][] = [];
function mount() {
  const root = mountQueryTestRoot();
  clients.push(root.client);
  return root;
}
function seedProfile(client: ReturnType<typeof mountQueryTestRoot>["client"]) {
  const session = getSessionContext(client);
  const token = session.captureRead();
  if (!token) throw new Error("Fixture session is pending");
  session.apply(token, { type: "me-valid", actorId: 1 });
  client.setQueryData(getAuthMeQueryKey(), profile);
}
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
});

describe("domain hooks keep local initial errors and share background errors", () => {
  it("keeps initial accounts failure silent, preserves validation and emits one background failure for two consumers", async () => {
    const root = mount();
    function Accounts() {
      const query = useAccounts();
      useAccounts();
      return (
        <>
          <div>{JSON.stringify(query.data)}</div>
          <div>{query.isError ? "accounts error" : "accounts ready"}</div>
          <button onClick={() => void query.refetch()}>Refresh accounts</button>
        </>
      );
    }
    fetchMock.mockResolvedValueOnce(
      Response.json(errorPayload, { status: 400 }),
    );
    root.rerenderChildren(<Accounts />);
    await screen.findByText("accounts error");
    expect(screen.queryByRole("button", { name: "×" })).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("[]")).toBeTruthy();
    fetchMock.mockResolvedValueOnce(Response.json([{ id: 7 }]));
    fireEvent.click(screen.getByRole("button", { name: "Refresh accounts" }));
    await screen.findByText("Некорректные данные");
    expect(screen.getByText('[{"id":7}]')).toBeTruthy();
    fetchMock.mockResolvedValueOnce(
      Response.json(errorPayload, { status: 400 }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Refresh accounts" }));
    await waitFor(() =>
      expect(screen.getAllByText("Не удалось выполнить запрос")).toHaveLength(
        1,
      ),
    );
    expect(screen.getAllByText("Некорректные данные")).toHaveLength(1);
    const queryError = root.client
      .getQueryCache()
      .getAll()
      .find((query) => query.state.error)?.state.error;
    expect(queryError).toBeInstanceOf(ApiError);
    expect(queryError).toMatchObject(errorPayload);
    expect(queryError).toHaveProperty("code", undefined);
    expect(screen.queryByText("HTTP_FAILURE")).toBeNull();
  });

  it("keeps scoped subcategory return validation while sharing one background failure", async () => {
    const root = mount();
    seedProfile(root.client);
    function Subcategories() {
      const query = useSubcategories(3);
      useSubcategories(3);
      return <div>{JSON.stringify(query.data)}</div>;
    }
    fetchMock.mockResolvedValueOnce(Response.json([{ id: 7 }]));
    root.rerenderChildren(<Subcategories />);
    await screen.findByText("Некорректные данные");
    expect(screen.getByText("[]")).toBeTruthy();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/v1/accounts/42/categories/3/subcategories",
    ]);
    fetchMock.mockResolvedValueOnce(
      Response.json(errorPayload, { status: 400 }),
    );
    await act(async () => {
      await root.client.refetchQueries({
        predicate: (query) => query.queryKey.includes("subcategories"),
      });
    });
    expect(screen.getAllByText("Не удалось выполнить запрос")).toHaveLength(1);
    expect(screen.queryByText("HTTP_FAILURE")).toBeNull();
    expect(screen.getAllByText("Некорректные данные")).toHaveLength(1);
    expect(screen.getByText("[]")).toBeTruthy();
  });

  it.each([401, 500, 0])(
    "keeps cached useMe status %s outside the generic path and supports explicit retry",
    async (statusCode) => {
      fetchMock.mockImplementation(() =>
        statusCode === 0
          ? Promise.reject(new TypeError("Offline"))
          : Promise.resolve(
              Response.json(
                { ...errorPayload, statusCode },
                { status: statusCode },
              ),
            ),
      );
      const { result, unmount } = renderHook(
        () => ({ client: useQueryClient(), query: useMe() }),
        { wrapper: QueryTestRoot },
      );
      const client = result.current.client;
      clients.push(client);
      await waitFor(() => expect(result.current.query.isError).toBe(true));
      expect(screen.queryByRole("button", { name: "×" })).toBeNull();
      fetchMock.mockResolvedValue(Response.json(profile));
      await act(async () => {
        await result.current.query.refetch();
      });
      await waitFor(() => expect(result.current.query.data).toEqual(profile));
      const calls = fetchMock.mock.calls.length;
      fetchMock.mockImplementation(() =>
        statusCode === 0
          ? Promise.reject(new TypeError("Offline"))
          : Promise.resolve(
              Response.json(
                { ...errorPayload, statusCode },
                { status: statusCode },
              ),
            ),
      );
      await act(async () => {
        await result.current.query.refetch();
      });
      await waitFor(() => expect(result.current.query.isError).toBe(true));
      expect(result.current.query.isUnauthorized).toBe(statusCode === 401);
      expect(fetchMock.mock.calls.length - calls).toBe(
        statusCode === 401 ? 2 : 1,
      );
      expect(screen.queryByRole("button", { name: "×" })).toBeNull();
      unmount();
    },
  );

  it("keeps an invitation profile-refresh failure inline without a generic toast", async () => {
    const root = mount();
    seedProfile(root.client);
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
    root.rerenderChildren(
      <InvitationRedemption
        code="code-a"
        onRedeemed={vi.fn()}
        onAuthenticationRequired={vi.fn()}
      />,
    );
    await screen.findByRole("button", { name: /Повторить/ });
    expect(screen.queryByRole("button", { name: "×" })).toBeNull();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/me")),
    ).toHaveLength(1);
  });
});
