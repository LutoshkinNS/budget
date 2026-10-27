import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { CategoryDTO } from "@/common/api/generate/model";

import { categoryKeys } from "../../model/category-keys";
import { CategoriesKeyboard } from "../categories-keyboard";

const notifications = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn() }));
vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: notifications.add,
    deleteNotification: notifications.remove,
  }),
}));

const CATEGORIES: CategoryDTO[] = [
  { id: 1, accountId: 42, type: "expense", name: "Частая", iconKey: null },
  { id: 2, accountId: 42, type: "expense", name: "Редкая", iconKey: null },
];
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
const pending: Array<() => void> = [];
function holdResponse(body: unknown = CATEGORIES) {
  return new Promise<Response>((resolve) => {
    pending.push(() => resolve(Response.json(body)));
  });
}
function status() {
  return screen.queryByRole("status", { name: "Загрузка категорий" });
}

beforeEach(() => {
  queryClient.clear();
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
});
afterEach(async () => {
  await act(async () => pending.splice(0).forEach((release) => release()));
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("CategoriesKeyboard independent initial loading", () => {
  it.each(["expense", "income"] as const)(
    "requests the backend usage order for %s",
    async (type) => {
      const fetchMock = vi.fn((_: RequestInfo | URL) =>
        Promise.resolve(
          Response.json(CATEGORIES.map((item) => ({ ...item, type }))),
        ),
      );
      vi.stubGlobal("fetch", fetchMock);
      render(
        <CategoriesKeyboard type={type} value={null} onChange={vi.fn()} />,
        {
          wrapper,
        },
      );
      expect(
        await screen.findByRole("button", { name: "Частая" }),
      ).toBeTruthy();
      const url = new URL(
        String(fetchMock.mock.calls[0]?.[0]),
        "http://localhost",
      );
      expect(url.pathname).toBe("/api/v1/accounts/42/categories");
      expect(url.searchParams.get("type")).toBe(type);
      expect(url.searchParams.get("sort")).toBe("usage");
      expect(status()).toBeNull();
    },
  );

  it("shows its local initial status until categories arrive", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => holdResponse()),
    );
    render(<CategoriesKeyboard value={null} onChange={vi.fn()} />, { wrapper });
    expect(status()).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Частая" })).toBeNull();
    await act(async () => pending.shift()?.());
    expect(await screen.findByRole("button", { name: "Частая" })).toBeTruthy();
    expect(status()).toBeNull();
  });

  it.each(["empty", "error"] as const)(
    "removes its status after an %s response",
    async (outcome) => {
      let release = () => {};
      vi.stubGlobal(
        "fetch",
        vi.fn(
          () =>
            new Promise<Response>((resolve) => {
              release = () =>
                resolve(
                  outcome === "empty"
                    ? Response.json([])
                    : Response.json(
                        {
                          code: "CATEGORY_DENIED",
                          message: "Denied",
                          statusCode: 403,
                        },
                        { status: 403 },
                      ),
                );
              pending.push(release);
            }),
        ),
      );
      render(<CategoriesKeyboard value={null} onChange={vi.fn()} />, {
        wrapper,
      });
      expect(status()).toBeTruthy();
      await act(async () => release());
      await waitFor(() => expect(status()).toBeNull());
      expect(screen.queryAllByRole("button")).toHaveLength(0);
      if (outcome === "error") {
        expect(notifications.add).toHaveBeenCalledWith(
          expect.objectContaining({ id: "useCategoriesError" }),
        );
      }
    },
  );

  it("keeps cached cards visible during a held background refetch", async () => {
    queryClient.setQueryData(
      categoryKeys.list(42, { type: "expense", sort: "usage" }),
      CATEGORIES,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(() => holdResponse()),
    );
    render(<CategoriesKeyboard value={null} onChange={vi.fn()} />, { wrapper });
    let refreshed = Promise.resolve();
    act(() => {
      refreshed = queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(42),
      });
    });
    await waitFor(() => expect(pending).toHaveLength(1));
    expect(screen.getByRole("button", { name: "Частая" })).toBeTruthy();
    expect(status()).toBeNull();
    await act(async () => pending.shift()?.());
    await refreshed;
  });

  it("uses the selected type loading state without showing the previous type", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) =>
        String(input).includes("type=income")
          ? holdResponse([
              {
                id: 9,
                accountId: 42,
                iconKey: null,
                type: "income",
                name: "Зарплата",
              },
            ])
          : Promise.resolve(Response.json(CATEGORIES)),
      ),
    );
    const view = render(
      <CategoriesKeyboard type="expense" value={null} onChange={vi.fn()} />,
      { wrapper },
    );
    await screen.findByRole("button", { name: "Частая" });
    view.rerender(
      <CategoriesKeyboard type="income" value={null} onChange={vi.fn()} />,
    );
    expect(status()).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Частая" })).toBeNull();
    await act(async () => pending.shift()?.());
    expect(
      await screen.findByRole("button", { name: "Зарплата" }),
    ).toBeTruthy();
    expect(status()).toBeNull();
  });

  it("does not show a permanent initial status without a selected account", () => {
    queryClient.setQueryData(getAuthMeQueryKey(), { accounts: [], userId: 1 });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<CategoriesKeyboard value={null} onChange={vi.fn()} />, { wrapper });
    expect(status()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
