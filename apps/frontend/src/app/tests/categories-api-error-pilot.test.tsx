import { type QueryClient } from "@tanstack/react-query";
import { act, cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { invalidateCategories, useCategories } from "@/modules/categories";
import { getSessionContext } from "@/modules/user";

import { mountQueryTestRoot } from "./mount-query-test-root";

const failure = {
  message: "Некорректные параметры запроса.",
  statusCode: 400,
};
const categories = [
  { id: 3, accountId: 42, type: "expense", name: "Продукты", iconKey: null },
];
const clients: QueryClient[] = [];

afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
});

function CategoriesObserver() {
  const query = useCategories({ type: "expense" });
  return (
    <div>
      {query.data.map((row) => row.name).join(",")}:
      {query.isError ? "failed" : "ready"}
    </div>
  );
}

describe("categories background error pilot", () => {
  it.each([false, true])(
    "retains loaded rows for two observers and shows one toast (StrictMode=%s)",
    async (strict) => {
      let fail = false;
      const fetchMock = vi.fn<typeof fetch>(async () =>
        fail
          ? Response.json(failure, { status: 400 })
          : Response.json(categories),
      );
      vi.stubGlobal("fetch", fetchMock);
      const root = mountQueryTestRoot(undefined, strict);
      clients.push(root.client);
      const session = getSessionContext(root.client);
      const token = session.captureRead();
      if (!token) throw new Error("Fixture session is pending");
      act(() => {
        session.apply(token, { type: "me-valid", actorId: 1 });
        root.client.setQueryData(getAuthMeQueryKey(), {
          userId: 1,
          accounts: [
            { id: 42, name: "Пилот", initialBalance: 0, isOwner: true },
          ],
        });
      });
      root.rerenderChildren(
        <>
          <CategoriesObserver />
          <CategoriesObserver />
        </>,
      );
      await waitFor(() =>
        expect(screen.getAllByText("Продукты:ready")).toHaveLength(2),
      );
      const initialCalls = fetchMock.mock.calls.length;
      fail = true;
      await act(async () => {
        await invalidateCategories(root.client, 42);
      });
      await waitFor(() =>
        expect(screen.getAllByText("Продукты:failed")).toHaveLength(2),
      );
      expect(fetchMock.mock.calls.length - initialCalls).toBe(1);
      if (!strict) expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(screen.getAllByRole("button", { name: "×" })).toHaveLength(1);
      expect(screen.getByText(failure.message)).toBeTruthy();
      expect(screen.queryAllByText("Не удалось выполнить запрос")).toHaveLength(
        1,
      );
      expect(screen.queryByText("VALIDATION_ERROR")).toBeNull();
    },
  );
});
