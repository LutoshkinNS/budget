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

import { queryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { TransactionDTO } from "@/common/api/generate/model";
import { invalidateCategories } from "@/modules/categories";
import { invalidateTransaction } from "@/modules/transactions";
import { getCurrentAccountIdSnapshot, switchAccount } from "@/modules/user";

import { EditTransaction } from "../edit-transaction.tsx";

const notifications = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: notifications.add,
    deleteNotification: vi.fn(),
  }),
}));

const TRANSACTION: TransactionDTO = {
  id: 7,
  accountId: 42,
  userId: 1,
  type: "expense",
  amount: 25,
  categoryId: 3,
  date: "2026-10-15T09:18:27.000Z",
  description: "Исходный комментарий",
};
const CATEGORIES = [
  { id: 3, accountId: 42, type: "expense", name: "Еда", iconKey: null },
  { id: 4, accountId: 42, type: "expense", name: "Такси", iconKey: null },
];

function barrier() {
  let release: (value: Response) => void = () => {};
  const promise = new Promise<Response>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

function seedAccount(accountId: number | undefined = 42, userId = 1) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    userId,
    accounts:
      accountId === undefined
        ? []
        : [
            {
              id: accountId,
              name: `Счёт ${accountId}`,
              initialBalance: 0,
              isOwner: true,
            },
          ],
  });
}

type Kind = "detail" | "categories" | "patch";
function http(
  respond: (
    kind: Kind,
    url: URL,
    init?: RequestInit,
  ) => Response | Promise<Response>,
) {
  const calls: Array<{ kind: Kind; url: URL; body: unknown }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      const kind =
        init?.method === "PATCH"
          ? "patch"
          : url.pathname.endsWith("categories")
            ? "categories"
            : "detail";
      const body: unknown =
        typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
      calls.push({ kind, url, body });
      return respond(kind, url, init);
    }),
  );
  return calls;
}

function input(name: string) {
  const element = screen.getByLabelText(name, { exact: true });
  if (!(element instanceof HTMLInputElement))
    throw new Error(`Expected input: ${name}`);
  return element;
}
function saveButton() {
  const element = screen.getByRole("button", {
    name: "Сохранить",
  });
  if (!(element instanceof HTMLButtonElement))
    throw new Error("Expected save button");
  return element;
}
function submit() {
  const form = input("Сумма").closest("form");
  if (!form) throw new Error("Expected editor form");
  fireEvent.submit(form);
}

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
const defaults = queryClient.getDefaultOptions();
beforeEach(() => {
  queryClient.clear();
  queryClient.setDefaultOptions({
    ...defaults,
    queries: { ...defaults.queries, retry: false },
  });
  seedAccount();
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  queryClient.setDefaultOptions(defaults);
  vi.unstubAllGlobals();
});

describe("edit transaction loading and workflow lifetime", () => {
  it("ignores PATCH completion after same-actor account switch before React commit", async () => {
    queryClient.setQueryData(getAuthMeQueryKey(), {
      userId: 1,
      accounts: [42, 43].map((id) => ({
        id,
        name: `Счёт ${id}`,
        initialBalance: 0,
        isOwner: true,
      })),
    });
    switchAccount(42);
    const patch = barrier();
    const onSaved = vi.fn();
    http((kind, url) =>
      kind === "patch"
        ? patch.promise
        : Response.json(
            kind === "categories"
              ? CATEGORIES
              : {
                  ...TRANSACTION,
                  accountId: Number(url.pathname.split("/")[4]),
                  amount: url.pathname.includes("/accounts/43/") ? 43 : 25,
                },
          ),
    );
    render(<EditTransaction transactionId={7} onSaved={onSaved} />, {
      wrapper,
    });
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    let unsubscribe = () => {};
    const mutationSettled = new Promise<void>((resolve) => {
      unsubscribe = queryClient.getMutationCache().subscribe((event) => {
        if (
          event.type === "updated" &&
          event.mutation.state.status === "success"
        )
          resolve();
      });
    });
    const transitions: Array<{
      accountId: number | undefined;
      renderedAmount: string;
    }> = [];
    try {
      submit();
      await waitFor(() => expect(queryClient.isMutating()).toBe(1));
      await act(async () => {
        seedAccount(43, 1);
        transitions.push({
          accountId: getCurrentAccountIdSnapshot(),
          renderedAmount: input("Сумма").value,
        });
        patch.release(Response.json(TRANSACTION));
        await mutationSettled;
      });
      expect(transitions).toEqual([{ accountId: 43, renderedAmount: "25" }]);
      expect({
        savedCallbacks: onSaved.mock.calls.length,
        successNotifications: notifications.add.mock.calls.length,
      }).toEqual({ savedCallbacks: 0, successNotifications: 0 });
    } finally {
      unsubscribe();
      act(() => {
        patch.release(Response.json(TRANSACTION));
        switchAccount(42);
      });
    }
  });

  it("keeps the original category and editable fields through initial category failure and Retry", async () => {
    let broken = true;
    const calls = http((kind) =>
      kind === "categories" && broken
        ? Response.json(
            { statusCode: 500, message: "Failure" },
            { status: 500 },
          )
        : Response.json(kind === "categories" ? CATEGORIES : TRANSACTION),
    );
    render(<EditTransaction transactionId={7} />, { wrapper });
    await waitFor(() =>
      expect(
        screen.queryByText(/Не удалось загрузить категории/),
      ).not.toBeNull(),
    );
    fireEvent.change(input("Комментарий"), {
      target: { value: "Черновик после ошибки" },
    });
    expect(saveButton().disabled).toBe(false);
    broken = false;
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    await waitFor(() =>
      expect(screen.queryByText(/Не удалось загрузить категории/)).toBeNull(),
    );
    expect(input("Комментарий").value).toBe("Черновик после ошибки");
    const category = screen.getByRole("combobox");
    if (!(category instanceof HTMLSelectElement))
      throw new Error("Expected category select");
    expect(category.value).toBe("3");
    expect(calls.filter(({ kind }) => kind === "categories")).toHaveLength(2);
  });

  it("does not repopulate cleared cache or apply UI completion after logout", async () => {
    const patch = barrier();
    const onSaved = vi.fn();
    http((kind) =>
      kind === "patch"
        ? patch.promise
        : Response.json(kind === "categories" ? CATEGORIES : TRANSACTION),
    );
    const view = render(
      <EditTransaction transactionId={7} onSaved={onSaved} />,
      { wrapper },
    );
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    const invalidation = vi.spyOn(queryClient, "invalidateQueries");
    try {
      submit();
      await waitFor(() => expect(queryClient.isMutating()).toBe(1));
      act(() => {
        view.unmount();
        queryClient.clear();
      });
      act(() => patch.release(Response.json(TRANSACTION)));
      await waitFor(() => expect(invalidation).toHaveBeenCalledTimes(5));
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
      expect(onSaved).not.toHaveBeenCalled();
      expect(notifications.add).not.toHaveBeenCalled();
    } finally {
      act(() => patch.release(Response.json(TRANSACTION)));
    }
  });

  it("keeps the shell while detail is held and permits save before categories finish", async () => {
    const detail = barrier();
    const categories = barrier();
    const patch = barrier();
    const calls = http((kind) =>
      kind === "detail"
        ? detail.promise
        : kind === "categories"
          ? categories.promise
          : patch.promise,
    );
    const onSaved = vi.fn();
    render(<EditTransaction transactionId={7} onSaved={onSaved} />, {
      wrapper,
    });
    try {
      await waitFor(() =>
        expect(calls.filter(({ kind }) => kind === "detail")).toHaveLength(1),
      );
      expect(
        screen.getByRole("heading", { name: "Редактировать операцию" }),
      ).toBeTruthy();
      const skeleton = screen.getByRole("status", {
        name: "Загрузка операции",
      });
      expect(skeleton.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
      expect(screen.queryByRole("button", { name: "Сохранить" })).toBeNull();
      expect(calls.filter(({ kind }) => kind === "categories")).toHaveLength(0);
      act(() => detail.release(Response.json(TRANSACTION)));
      await waitFor(() =>
        expect(calls.filter(({ kind }) => kind === "categories")).toHaveLength(
          1,
        ),
      );
      expect(input("Сумма").value).toBe("25");
      expect(input("Дата").disabled).toBe(false);
      expect(input("Комментарий").disabled).toBe(false);
      expect(
        screen.queryByRole("status", { name: "Загрузка операции" }),
      ).toBeNull();
      expect(saveButton().disabled).toBe(false);
      submit();
      await waitFor(() =>
        expect(calls.filter(({ kind }) => kind === "patch")).toHaveLength(1),
      );
      expect(calls.find(({ kind }) => kind === "patch")?.body).toMatchObject({
        categoryId: 3,
        type: "expense",
        date: TRANSACTION.date,
      });
      act(() => patch.release(Response.json(TRANSACTION)));
      await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    } finally {
      act(() => {
        detail.release(Response.json(TRANSACTION));
        categories.release(Response.json(CATEGORIES));
        patch.release(Response.json(TRANSACTION));
      });
    }
  });

  it("keeps the draft and original date/type through background data and category reorder", async () => {
    let current = TRANSACTION;
    let categories = CATEGORIES;
    const calls = http((kind) =>
      Response.json(kind === "categories" ? categories : current),
    );
    const onSaved = vi.fn();
    render(<EditTransaction transactionId={7} onSaved={onSaved} />, {
      wrapper,
    });
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    const originalDate = input("Дата").value;
    fireEvent.change(input("Сумма"), { target: { value: "88.5" } });
    fireEvent.change(input("Комментарий"), {
      target: { value: "Локальный ввод" },
    });
    current = {
      ...TRANSACTION,
      amount: 999,
      date: "2026-10-20T20:10:00.000Z",
      type: "income",
      description: "Фоновая версия",
      categoryId: 4,
    };
    categories = [...CATEGORIES].reverse();
    await act(async () => {
      await Promise.all([
        invalidateTransaction(42, 7),
        invalidateCategories(42),
      ]);
    });
    expect(input("Сумма").value).toBe("88.5");
    expect(input("Дата").value).toBe(originalDate);
    expect(input("Комментарий").value).toBe("Локальный ввод");
    const category = screen.getByRole("combobox");
    if (!(category instanceof HTMLSelectElement))
      throw new Error("Expected category select");
    expect(category.value).toBe("3");
    submit();
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(calls.find(({ kind }) => kind === "patch")?.body).toEqual({
      amount: 88.5,
      categoryId: 3,
      date: TRANSACTION.date,
      type: "expense",
      description: "Локальный ввод",
    });
  });

  it.each(["network", "server", "schema"] as const)(
    "keeps editable draft after background %s failure and retries locally",
    async (failure) => {
      let broken = false;
      const calls = http((kind) => {
        if (kind !== "detail")
          return Response.json(
            kind === "categories" ? CATEGORIES : TRANSACTION,
          );
        if (!broken) return Response.json(TRANSACTION);
        if (failure === "network") throw new TypeError("offline");
        return failure === "server"
          ? Response.json(
              { statusCode: 500, message: "Failure" },
              { status: 500 },
            )
          : Response.json({ ...TRANSACTION, amount: "invalid" });
      });
      render(<EditTransaction transactionId={7} />, { wrapper });
      await waitFor(() =>
        expect(screen.queryByRole("combobox")).not.toBeNull(),
      );
      fireEvent.change(input("Комментарий"), {
        target: { value: "Сохранённый ввод" },
      });
      broken = true;
      await act(async () => {
        await invalidateTransaction(42, 7);
      });
      await waitFor(() =>
        expect(
          screen.getByText("Не удалось обновить данные операции."),
        ).toBeTruthy(),
      );
      expect(input("Комментарий").value).toBe("Сохранённый ввод");
      expect(saveButton().disabled).toBe(false);
      broken = false;
      fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
      await waitFor(() =>
        expect(
          screen.queryByText("Не удалось обновить данные операции."),
        ).toBeNull(),
      );
      expect(calls.filter(({ kind }) => kind === "detail")).toHaveLength(3);
      expect(input("Комментарий").value).toBe("Сохранённый ввод");
    },
  );

  it("reports background detail refresh locally while retaining the form", async () => {
    const refresh = barrier();
    let reads = 0;
    http((kind) =>
      kind === "categories"
        ? Response.json(CATEGORIES)
        : ++reads === 1
          ? Response.json(TRANSACTION)
          : refresh.promise,
    );
    render(<EditTransaction transactionId={7} />, { wrapper });
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    try {
      act(() => {
        void invalidateTransaction(42, 7);
      });
      await waitFor(() => expect(reads).toBe(2));
      expect(input("Сумма").value).toBe("25");
      await waitFor(() =>
        expect(
          screen.queryByRole("status", { name: /обновлен|обновля/i }),
        ).not.toBeNull(),
      );
    } finally {
      act(() => refresh.release(Response.json(TRANSACTION)));
    }
  });

  it("blocks cached detail after 404, preserves draft and restores save only after successful revalidation", async () => {
    let missing = false;
    const calls = http((kind) =>
      kind === "detail" && missing
        ? Response.json(
            { statusCode: 404, message: "Not found" },
            { status: 404 },
          )
        : Response.json(kind === "categories" ? CATEGORIES : TRANSACTION),
    );
    render(<EditTransaction transactionId={7} />, { wrapper });
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    fireEvent.change(input("Комментарий"), { target: { value: "Не терять" } });
    missing = true;
    await act(async () => {
      await invalidateTransaction(42, 7);
    });
    await waitFor(() =>
      expect(calls.filter(({ kind }) => kind === "detail")).toHaveLength(2),
    );
    expect(input("Комментарий").value).toBe("Не терять");
    await waitFor(() => expect(saveButton().disabled).toBe(true));
    expect(screen.getByRole("alert").textContent).toContain(
      "Операция недоступна",
    );
    submit();
    expect(calls.filter(({ kind }) => kind === "patch")).toHaveLength(0);
    missing = false;
    fireEvent.click(screen.getByRole("button", { name: "Проверить доступ" }));
    await waitFor(() => expect(saveButton().disabled).toBe(false));
    expect(input("Комментарий").value).toBe("Не терять");
  });

  it("names the category loading status while other fields are ready", async () => {
    const categories = barrier();
    let categoriesRequested = false;
    http((kind) => {
      if (kind === "categories") {
        categoriesRequested = true;
        return categories.promise;
      }
      return Response.json(TRANSACTION);
    });
    render(<EditTransaction transactionId={7} />, { wrapper });
    try {
      await waitFor(() => expect(categoriesRequested).toBe(true));
      expect(input("Сумма").value).toBe("25");
      await waitFor(() =>
        expect(
          screen.queryByRole("status", { name: /загрузка категори/i }),
        ).not.toBeNull(),
      );
    } finally {
      act(() => categories.release(Response.json(CATEGORIES)));
    }
  });

  it("reports background category refresh without hiding the chosen option", async () => {
    const categories = barrier();
    let reads = 0;
    http((kind) =>
      kind === "categories"
        ? ++reads === 1
          ? Response.json(CATEGORIES)
          : categories.promise
        : Response.json(TRANSACTION),
    );
    render(<EditTransaction transactionId={7} />, { wrapper });
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    try {
      act(() => {
        void invalidateCategories(42);
      });
      await waitFor(() => expect(reads).toBe(2));
      const category = screen.getByRole("combobox");
      if (!(category instanceof HTMLSelectElement))
        throw new Error("Expected category select");
      expect(category.value).toBe("3");
      expect(saveButton().disabled).toBe(false);
      await waitFor(() =>
        expect(
          screen.queryByRole("status", { name: /обновлен|обновля/i }),
        ).not.toBeNull(),
      );
    } finally {
      act(() => categories.release(Response.json(CATEGORIES)));
    }
  });

  it("offers Retry for initial forbidden detail and does not expose an editable form", async () => {
    let forbidden = true;
    http((kind) =>
      kind === "detail" && forbidden
        ? Response.json(
            { statusCode: 403, message: "Forbidden" },
            { status: 403 },
          )
        : Response.json(kind === "categories" ? CATEGORIES : TRANSACTION),
    );
    render(<EditTransaction transactionId={7} />, { wrapper });
    await waitFor(() =>
      expect(screen.queryByText("Нет доступа к этой операции")).not.toBeNull(),
    );
    expect(screen.queryByLabelText("Сумма", { exact: true })).toBeNull();
    const retry = screen.queryByRole("button", { name: "Повторить" });
    expect(retry).not.toBeNull();
    forbidden = false;
    if (retry) fireEvent.click(retry);
    await waitFor(() => expect(input("Сумма").value).toBe("25"));
  });

  it.each(["not-found", "schema", "network"] as const)(
    "handles initial %s with local Retry",
    async (failure) => {
      let broken = true;
      http((kind) => {
        if (kind !== "detail" || !broken)
          return Response.json(kind === "categories" ? [] : TRANSACTION);
        if (failure === "network") throw new TypeError("offline");
        return failure === "not-found"
          ? Response.json(
              { statusCode: 404, message: "Not found" },
              { status: 404 },
            )
          : Response.json({ ...TRANSACTION, categoryId: "bad" });
      });
      render(<EditTransaction transactionId={7} />, { wrapper });
      await waitFor(() =>
        expect(
          screen.queryByText(
            failure === "not-found"
              ? "Операция не найдена"
              : "Не удалось загрузить операцию",
          ),
        ).not.toBeNull(),
      );
      expect(screen.queryByRole("button", { name: "Сохранить" })).toBeNull();
      broken = false;
      fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
      await waitFor(() => expect(input("Сумма").value).toBe("25"));
      await waitFor(() =>
        expect(screen.queryByRole("combobox")).not.toBeNull(),
      );
      expect(screen.queryByText(/Не удалось загрузить категории/)).toBeNull();
      expect(saveButton().disabled).toBe(false);
    },
  );

  it("keeps PATCH error local, allows retry, prevents duplicate submit and finishes before invalidation GET", async () => {
    const first = barrier();
    const second = barrier();
    const refresh = barrier();
    let patches = 0;
    let details = 0;
    const onSaved = vi.fn();
    const calls = http((kind) =>
      kind === "patch"
        ? ++patches === 1
          ? first.promise
          : second.promise
        : kind === "categories"
          ? Response.json(CATEGORIES)
          : ++details === 1
            ? Response.json(TRANSACTION)
            : refresh.promise,
    );
    render(<EditTransaction transactionId={7} onSaved={onSaved} />, {
      wrapper,
    });
    await waitFor(() => expect(screen.queryByRole("combobox")).not.toBeNull());
    fireEvent.change(input("Комментарий"), { target: { value: "Черновик" } });
    try {
      act(() => {
        submit();
        submit();
      });
      await waitFor(() => expect(patches).toBe(1));
      expect(
        screen
          .getByRole("button", { name: "Сохранение..." })
          .getAttribute("disabled"),
      ).not.toBeNull();
      expect(input("Комментарий").matches(":disabled")).toBe(true);
      act(() =>
        first.release(
          Response.json(
            { statusCode: 422, message: "Invalid data" },
            { status: 422 },
          ),
        ),
      );
      await waitFor(() =>
        expect(screen.getByRole("alert").textContent).toContain(
          "Не удалось сохранить операцию",
        ),
      );
      expect(input("Комментарий").value).toBe("Черновик");
      expect(onSaved).not.toHaveBeenCalled();
      expect(notifications.add).not.toHaveBeenCalled();
      submit();
      await waitFor(() => expect(patches).toBe(2));
      act(() => second.release(Response.json(TRANSACTION)));
      await waitFor(() => {
        expect(onSaved).toHaveBeenCalledTimes(1);
        expect(details).toBe(2);
      });
      expect(queryClient.isFetching()).toBeGreaterThan(0);
      expect(
        calls
          .filter(({ kind }) => kind === "patch")
          .every(
            ({ body }) =>
              typeof body === "object" &&
              body !== null &&
              "description" in body &&
              body.description === "Черновик",
          ),
      ).toBe(true);
    } finally {
      act(() => {
        first.release(Response.json(TRANSACTION));
        second.release(Response.json(TRANSACTION));
        refresh.release(Response.json(TRANSACTION));
      });
    }
  });

  it.each([403, 404])(
    "requires read revalidation after PATCH %s before another write",
    async (statusCode) => {
      let patches = 0;
      http((kind) =>
        kind === "patch" && ++patches === 1
          ? Response.json(
              { statusCode, message: "Unavailable" },
              { status: statusCode },
            )
          : Response.json(kind === "categories" ? CATEGORIES : TRANSACTION),
      );
      render(<EditTransaction transactionId={7} />, { wrapper });
      await waitFor(() =>
        expect(screen.queryByRole("combobox")).not.toBeNull(),
      );
      submit();
      await waitFor(() =>
        expect(screen.getByRole("alert").textContent).toContain(
          "Операция недоступна",
        ),
      );
      expect(saveButton().disabled).toBe(true);
      submit();
      expect(patches).toBe(1);
      fireEvent.click(screen.getByRole("button", { name: "Проверить доступ" }));
      await waitFor(() => expect(saveButton().disabled).toBe(false));
    },
  );

  it.each(["entity", "account", "actor", "unmount"] as const)(
    "ignores late completion after %s changes",
    async (transition) => {
      const patch = barrier();
      const onSaved = vi.fn();
      http((kind, url) =>
        kind === "patch"
          ? patch.promise
          : Response.json(
              kind === "categories"
                ? CATEGORIES
                : {
                    ...TRANSACTION,
                    id: Number(url.pathname.split("/").pop()),
                    accountId: Number(url.pathname.split("/")[4]),
                    amount: url.pathname.endsWith("/8") ? 80 : 25,
                  },
            ),
      );
      const view = render(
        <EditTransaction transactionId={7} onSaved={onSaved} />,
        { wrapper },
      );
      await waitFor(() =>
        expect(screen.queryByRole("combobox")).not.toBeNull(),
      );
      try {
        submit();
        await waitFor(() =>
          expect(
            screen.queryByRole("button", { name: "Сохранение..." }),
          ).not.toBeNull(),
        );
        if (transition === "entity")
          view.rerender(
            <EditTransaction transactionId={8} onSaved={onSaved} />,
          );
        if (transition === "account") act(() => seedAccount(43));
        if (transition === "actor") act(() => seedAccount(42, 2));
        if (transition === "unmount") view.unmount();
        if (transition === "entity" || transition === "account") {
          await waitFor(() =>
            expect(
              screen.queryByRole("button", { name: "Сохранить" }),
            ).not.toBeNull(),
          );
          fireEvent.change(input("Комментарий"), {
            target: { value: "Ввод нового контекста" },
          });
        }
        await act(async () => {
          patch.release(Response.json(TRANSACTION));
          await patch.promise;
        });
        await waitFor(() => expect(queryClient.isMutating()).toBe(0));
        expect(onSaved).not.toHaveBeenCalled();
        expect(notifications.add).not.toHaveBeenCalled();
        if (transition === "entity" || transition === "account")
          expect(input("Комментарий").value).toBe("Ввод нового контекста");
      } finally {
        act(() => patch.release(Response.json(TRANSACTION)));
      }
    },
  );
});
