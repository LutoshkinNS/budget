import { useLayoutEffect } from "react";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { act, cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { TransactionDTO, UserInfoDTO } from "@/common/api/generate/model";
import { deferred } from "@/common/api/tests/deferred";
import { invalidateCategories, useCategories } from "@/modules/categories";
import {
  invalidateTransactionsList,
  useCreateTransaction,
  useTransactionsListQuery,
  useUpdateTransaction,
} from "@/modules/transactions";
import {
  getCurrentAccountIdSnapshot,
  getCurrentUserIdSnapshot,
  getSessionContext,
  requireCurrentAccountId,
  switchAccount,
  useCurrentAccountId,
} from "@/modules/user";

import { mountQueryTestRoot } from "./mount-query-test-root";

const range = {
  from: "2026-11-10T00:00:00.000Z",
  to: "2026-11-11T00:00:00.000Z",
};
const account = (id: number) => ({
  id,
  name: `Счёт ${id}`,
  initialBalance: 0,
  isOwner: true,
});
const firstProfile = { userId: 1, accounts: [account(42), account(43)] };
const secondProfile = { userId: 2, accounts: [account(99)] };
const transaction: TransactionDTO = {
  id: 7,
  accountId: 42,
  userId: 1,
  categoryId: 3,
  amount: 10,
  type: "expense",
  date: "2026-11-10T09:00:00.000Z",
  description: "Сохранённая операция",
};
const input = {
  amount: 20,
  categoryId: 3,
  type: "expense",
  date: transaction.date,
} as const;
type Actions = {
  client: QueryClient;
  create: ReturnType<typeof useCreateTransaction>;
  update: ReturnType<typeof useUpdateTransaction>;
};
const fetchMock = vi.fn<typeof fetch>();
const clients: QueryClient[] = [];

function seed(client: QueryClient, profile: UserInfoDTO) {
  const session = getSessionContext(client);
  const token = session.captureRead();
  if (!token) throw new Error("Fixture session is pending");
  session.apply(token, { type: "me-valid", actorId: profile.userId });
  client.setQueryData(getAuthMeQueryKey(), profile);
}

function mount(profile: UserInfoDTO, label: string) {
  const root = mountQueryTestRoot();
  clients.push(root.client);
  seed(root.client, profile);
  let latest: Actions | undefined;
  const receive = (actions: Actions) => {
    latest = actions;
  };
  function Probe() {
    const client = useQueryClient();
    const currentAccount = useCurrentAccountId();
    const query = useTransactionsListQuery(range);
    useCategories();
    const create = useCreateTransaction();
    const update = useUpdateTransaction(7, 42, 1);
    useLayoutEffect(() => receive({ client, create, update }));
    return (
      <>
        <div data-testid={`${label}-account`}>{currentAccount}</div>
        <div data-testid={`${label}-data`}>{JSON.stringify(query.data)}</div>
      </>
    );
  }
  root.rerenderChildren(<Probe />);
  return {
    ...root,
    actions: () => {
      if (!latest) throw new Error("Missing probe actions");
      return latest;
    },
  };
}

function installHttp(hold?: { method: string; response: Promise<Response> }) {
  fetchMock.mockImplementation(async (input, options) => {
    const url = new URL(String(input), "http://localhost");
    const method = options?.method ?? "GET";
    if (hold && method === hold.method) return hold.response;
    const accountId = Number(url.pathname.split("/")[4]);
    if (url.pathname.endsWith("/transactions")) {
      if (method === "POST")
        return Response.json({ ...transaction, id: 8, accountId });
      return Response.json([
        { ...transaction, accountId, description: `Операция ${accountId}` },
      ]);
    }
    if (url.pathname.endsWith("/categories"))
      return Response.json([
        { id: 3, accountId, type: "expense", name: "Категория", iconKey: null },
      ]);
    throw new Error(`Unexpected HTTP: ${method} ${url.pathname}`);
  });
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

describe("provider-scoped query, session and mutation dependencies", () => {
  it("observes, mutates and invalidates the captured root without touching another root cache or session", async () => {
    installHttp();
    const a = mount(firstProfile, "a");
    act(() => switchAccount(a.client, 42));
    await waitFor(() =>
      expect(screen.getByTestId("a-data").textContent).toContain("Операция 42"),
    );
    const b = mount(secondProfile, "b");
    await waitFor(() =>
      expect(screen.getByTestId("b-data").textContent).toContain("Операция 99"),
    );
    expect(a.actions().client).toBe(a.client);
    expect(b.actions().client).toBe(b.client);
    expect(getCurrentUserIdSnapshot(a.client)).toBe(1);
    expect(getCurrentUserIdSnapshot(b.client)).toBe(2);
    expect(requireCurrentAccountId(a.client)).toBe(42);
    expect(requireCurrentAccountId(b.client)).toBe(99);
    const keyA = a.client
      .getQueryCache()
      .getAll()
      .find((query) => query.queryKey.includes("transactions"))?.queryKey;
    if (!keyA) throw new Error("Missing observed transaction query");
    b.client.setQueryData(keyA, "B-only sentinel");
    const requestsB = () =>
      fetchMock.mock.calls.filter(([url]) =>
        String(url).includes("/accounts/99/"),
      ).length;
    const previousRequestsB = requestsB();
    await act(async () => {
      await a.actions().create.createTransaction(input);
      await invalidateTransactionsList(a.client, 42);
    });
    expect(
      fetchMock.mock.calls.some(
        ([url, options]) =>
          String(url) === "/api/v1/accounts/42/transactions" &&
          options?.method === "POST",
      ),
    ).toBe(true);
    expect(b.client.getQueryData(keyA)).toBe("B-only sentinel");
    expect(b.client.getQueryState(keyA)?.isInvalidated).toBe(false);
    expect(requestsB()).toBe(previousRequestsB);
    expect(getSessionContext(b.client).getSnapshot().actorId).toBe(2);
    await act(async () => {
      await invalidateCategories(b.client, 99);
    });
    expect(requestsB()).toBe(previousRequestsB + 1);
  });

  it("retains invocation account through a delayed create and isolates late update feedback from another root's actor", async () => {
    const createResponse = deferred<Response>();
    installHttp({ method: "POST", response: createResponse.promise });
    const a = mount(firstProfile, "a");
    act(() => switchAccount(a.client, 42));
    await waitFor(() =>
      expect(screen.getByTestId("a-data").textContent).toContain("Операция 42"),
    );
    const b = mount(secondProfile, "b");
    await waitFor(() =>
      expect(screen.getByTestId("b-data").textContent).toContain("Операция 99"),
    );
    const keyA = a.client
      .getQueryCache()
      .getAll()
      .find((query) => query.queryKey.includes("transactions"))?.queryKey;
    if (!keyA) throw new Error("Missing original transaction query");
    let pendingCreate: Promise<unknown> | undefined;
    act(() => {
      pendingCreate = a.actions().create.createTransaction(input);
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([, options]) => options?.method === "POST"),
      ).toBe(true),
    );
    act(() => switchAccount(a.client, 43));
    await waitFor(() =>
      expect(screen.getByTestId("a-account").textContent).toBe("43"),
    );
    a.client.setQueryData(keyA, [transaction]);
    await act(async () => {
      createResponse.resolve(Response.json({ ...transaction, id: 8 }));
      await pendingCreate;
    });
    expect(a.client.getQueryState(keyA)?.isInvalidated).toBe(true);
    expect(getCurrentAccountIdSnapshot(a.client)).toBe(43);
    expect(getCurrentAccountIdSnapshot(b.client)).toBe(99);

    const updateResponse = deferred<Response>();
    installHttp({ method: "PATCH", response: updateResponse.promise });
    let pendingUpdate: Promise<unknown> | undefined;
    act(() => {
      pendingUpdate = a
        .actions()
        .update.updateTransaction({ ...input, description: null });
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([, options]) => options?.method === "PATCH"),
      ).toBe(true),
    );
    const sessionA = getSessionContext(a.client);
    const login = sessionA.beginCommand("login");
    sessionA.apply(login, { type: "login-success" });
    act(() => seed(a.client, { ...firstProfile, userId: 3 }));
    await act(async () => {
      updateResponse.resolve(Response.json(transaction));
      await pendingUpdate;
    });
    expect(within(a.container).queryByText("Операция сохранена")).toBeNull();
    expect(within(b.container).queryByText("Операция сохранена")).toBeNull();
    expect(getCurrentUserIdSnapshot(a.client)).toBe(3);
    expect(getCurrentUserIdSnapshot(b.client)).toBe(2);
  });
});
