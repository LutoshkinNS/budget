import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { TransactionDTO } from "@/common/api/generate/model";

import { TransactionDayItem } from "../transaction-day-item.tsx";

const notifications = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn() }));
vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: notifications.add,
    deleteNotification: notifications.remove,
  }),
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const TRANSACTION: TransactionDTO = {
  id: 101,
  accountId: 42,
  amount: 10,
  categoryId: 3,
  userId: 1,
  type: "expense",
  date: "2026-10-15T09:00:00.000Z",
  description: "Кофе",
};
const OTHER: TransactionDTO = {
  ...TRANSACTION,
  id: 202,
  description: "Чай",
};

const pendingDeletes: Array<() => void> = [];

beforeEach(() => {
  queryClient.clear();
  window.localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      if (init?.method === "DELETE") {
        return new Promise<Response>((resolve) => {
          pendingDeletes.push(() => resolve(new Response(null, { status: 204 })));
        });
      }
      if (url.pathname.endsWith("/categories")) {
        return Promise.resolve(Response.json([]));
      }
      return Promise.resolve(Response.json([]));
    }),
  );
  vi.spyOn(window, "confirm").mockReturnValue(true);
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
});
afterEach(async () => {
  await act(async () =>
    pendingDeletes.splice(0).forEach((release) => release()),
  );
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("TransactionDayItem delete pending scope", () => {
  it("locks only the deleting row while the DELETE is in flight", async () => {
    render(
      <>
        <TransactionDayItem transaction={TRANSACTION} onEdit={vi.fn()} />
        <TransactionDayItem transaction={OTHER} onEdit={vi.fn()} />
      </>,
      { wrapper },
    );

    const [firstDelete, secondDelete] = screen.getAllByRole("button", {
      name: "Удалить расход",
    });
    if (!firstDelete || !secondDelete) {
      throw new Error("delete buttons not rendered");
    }
    const firstEdit = screen.getByRole("button", { name: /Кофе/ });
    const secondEdit = screen.getByRole("button", { name: /Чай/ });

    fireEvent.click(firstDelete);
    await waitFor(() => expect(pendingDeletes).toHaveLength(1));

    expect(firstDelete.matches(":disabled")).toBe(true);
    expect(firstEdit.matches(":disabled")).toBe(true);
    // Соседняя строка остаётся доступной во время чужого удаления.
    expect(secondDelete.matches(":disabled")).toBe(false);
    expect(secondEdit.matches(":disabled")).toBe(false);

    await act(async () =>
      pendingDeletes.splice(0).forEach((release) => release()),
    );
    await waitFor(() => expect(firstDelete.matches(":disabled")).toBe(false));
  });
});
