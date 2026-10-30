import { QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { CategoryDTO, UserInfoDTO } from "@/common/api/generate/model";
import { Notifications } from "@/common/lib/notifications";
import { categoryKeys } from "@/modules/categories/model/category-keys";
import { switchAccount } from "@/modules/user";

import { Categories } from "../categories";

const ME: UserInfoDTO = {
  userId: 1,
  accounts: [
    { id: 42, name: "Первый счёт", initialBalance: 0, isOwner: true },
    { id: 43, name: "Второй счёт", initialBalance: 0, isOwner: true },
  ],
};
const defaultOptions = queryClient.getDefaultOptions();
const gates: ResponseGate[] = [];

class ResponseGate {
  private open = false;
  private pending: Array<() => void> = [];

  constructor() {
    gates.push(this);
  }

  get heldCount() {
    return this.pending.length;
  }

  wait() {
    if (this.open) return Promise.resolve();
    return new Promise<void>((resolve) => this.pending.push(resolve));
  }

  release() {
    this.open = true;
    this.pending.splice(0).forEach((resolve) => resolve());
  }
}

type HttpCall = {
  method: string;
  accountId: number;
  categoryId: number | undefined;
  type: string | null;
  body: unknown;
};

function category(
  accountId = 42,
  type: "expense" | "income" = "expense",
): CategoryDTO {
  return {
    id: accountId === 42 ? (type === "expense" ? 3 : 4) : 5,
    accountId,
    type,
    name: `${type === "expense" ? "Еда" : "Зарплата"} счёта ${accountId}`,
    iconKey: null,
  };
}

function installApi(
  handler?: (call: HttpCall) => Response | Promise<Response>,
) {
  const calls: HttpCall[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://budget.test");
      if (url.pathname === "/api/v1/auth/me") return Response.json(ME);
      const match = url.pathname.match(
        /^\/api\/v1\/accounts\/(42|43)\/categories(?:\/(\d+))?$/,
      );
      if (!match) throw new Error(`Unexpected request: ${url}`);
      const call: HttpCall = {
        method: init?.method ?? "GET",
        accountId: Number(match[1]),
        categoryId: match[2] ? Number(match[2]) : undefined,
        type: url.searchParams.get("type"),
        body:
          typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
      };
      calls.push(call);
      if (handler) return handler(call);
      return Response.json([
        category(call.accountId, call.type === "income" ? "income" : "expense"),
      ]);
    }),
  );
  return calls;
}

function renderPage() {
  return render(
    <Notifications>
      <QueryClientProvider client={queryClient}>
        <Categories />
      </QueryClientProvider>
    </Notifications>,
  );
}

function group(name: string | RegExp) {
  const node = screen.getByRole("group", { name });
  if (!(node instanceof HTMLFieldSetElement))
    throw new Error("Expected a fieldset");
  return node;
}

function nameInput(container: HTMLElement) {
  const node = within(container).getByLabelText("Наименование категории");
  if (!(node instanceof HTMLInputElement)) throw new Error("Expected an input");
  return node;
}

function select(container: HTMLElement) {
  const node = within(container).getByRole("combobox");
  if (!(node instanceof HTMLSelectElement))
    throw new Error("Expected a select");
  return node;
}

function submit(container: HTMLElement, twice = false) {
  const form = container.closest("form");
  if (!form) throw new Error("Expected a form");
  act(() => {
    fireEvent.submit(form);
    if (twice) fireEvent.submit(form);
  });
}

async function readyCategory(accountId = 42) {
  return screen.findByRole("button", {
    name: `Изменить категорию ${category(accountId).name}`,
  });
}

beforeEach(() => {
  queryClient.clear();
  queryClient.setDefaultOptions({
    ...defaultOptions,
    queries: { ...defaultOptions.queries, retry: false },
  });
  queryClient.setQueryData(getAuthMeQueryKey(), ME);
  switchAccount(42);
});

afterEach(async () => {
  await act(async () => gates.splice(0).forEach((gate) => gate.release()));
  cleanup();
  await queryClient.cancelQueries();
  queryClient.clear();
  queryClient.setDefaultOptions(defaultOptions);
  vi.unstubAllGlobals();
});

describe("Categories local loading and actions", () => {
  it("keeps the create form and type controls ready while list and select wait", async () => {
    const read = new ResponseGate();
    installApi(async (call) => {
      await read.wait();
      return Response.json([category(call.accountId)]);
    });
    renderPage();

    await waitFor(() => expect(read.heldCount).toBe(1));
    const list = group("Список категорий");
    const deletion = group("Удаление категории");
    expect(
      within(list).getByRole("status").getAttribute("aria-label"),
    ).toBeTruthy();
    expect(
      within(deletion).getByRole("status").getAttribute("aria-label"),
    ).toBeTruthy();
    expect(
      within(list).getByRole("status").querySelector('[aria-hidden="true"]'),
    ).not.toBeNull();
    expect(screen.queryByText("Категорий не найдено")).toBeNull();
    const creation = group("Создание новой категории");
    fireEvent.change(nameInput(creation), { target: { value: "Новая" } });
    expect(creation.disabled).toBe(false);
    expect(
      within(creation)
        .getByRole("button", { name: "Создать" })
        .hasAttribute("disabled"),
    ).toBe(false);
    expect(
      screen.getByRole("button", { name: "доходы" }).hasAttribute("disabled"),
    ).toBe(false);

    await act(async () => read.release());
    await readyCategory();
    expect(within(list).queryByRole("status")).toBeNull();
    expect(within(deletion).queryByRole("status")).toBeNull();
  });

  it.each(["server", "network", "schema"] as const)(
    "offers local retry after an initial %s failure",
    async (failure) => {
      let failed = true;
      const calls = installApi(() => {
        if (!failed) return Response.json([category()]);
        if (failure === "network")
          return Promise.reject(new TypeError("Network failure"));
        if (failure === "schema") return Response.json({ items: [] });
        return Response.json(
          { statusCode: 500, code: "UNAVAILABLE" },
          { status: 500 },
        );
      });
      renderPage();
      const list = group("Список категорий");
      const retry = await within(list).findByRole("button", {
        name: /Повторить/,
      });
      expect(within(list).queryByRole("status")).toBeNull();
      expect(
        within(group("Удаление категории")).getByRole("button", {
          name: /Повторить/,
        }),
      ).not.toBeNull();
      expect(group("Создание новой категории").disabled).toBe(false);
      const beforeRetry = calls.length;
      failed = false;
      fireEvent.click(retry);

      await readyCategory();
      expect(calls).toHaveLength(beforeRetry + 1);
      expect(
        within(list).queryByRole("button", { name: /Повторить/ }),
      ).toBeNull();
      expect(select(group("Удаление категории")).options).toHaveLength(2);
    },
  );

  it("distinguishes a successful empty list from loading or failure", async () => {
    installApi(() => Response.json([]));
    renderPage();
    await waitFor(() => {
      expect(group("Список категорий").textContent).toMatch(
        /категори.*(?:нет|пока)/i,
      );
    });
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("button", { name: /Повторить/ })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Изменить категорию/ }),
    ).toBeNull();
    expect(
      within(group("Удаление категории"))
        .getByRole("button", { name: "Удалить" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("shows a fresh cached list on remount without another skeleton or GET", async () => {
    queryClient.setQueryData(categoryKeys.list(42, { type: "expense" }), [
      category(),
    ]);
    const calls = installApi();
    const first = renderPage();
    expect(
      screen.getByRole("button", {
        name: `Изменить категорию ${category().name}`,
      }),
    ).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    first.unmount();
    renderPage();
    expect(
      screen.getByRole("button", {
        name: `Изменить категорию ${category().name}`,
      }),
    ).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it.each(["server", "schema"] as const)(
    "retains the list and editor draft after a background %s failure and retry",
    async (failure) => {
      let failed = false;
      let refreshed = false;
      const nextRead = new ResponseGate();
      let holdNextRead = false;
      installApi(async () => {
        if (holdNextRead) await nextRead.wait();
        if (!failed)
          return Response.json([
            {
              ...category(),
              name: refreshed ? "Обновлённая категория" : category().name,
            },
          ]);
        if (failure === "schema") return Response.json({ items: [] });
        return Response.json(
          { statusCode: 500, code: "UNAVAILABLE" },
          { status: 500 },
        );
      });
      renderPage();
      fireEvent.click(await readyCategory());
      fireEvent.change(nameInput(group(/Редактирование категории/)), {
        target: { value: "Мой черновик" },
      });
      failed = true;
      await act(async () => {
        await queryClient.invalidateQueries({
          queryKey: categoryKeys.list(42, { type: "expense" }),
        });
      });
      const list = group("Список категорий");
      const retry = await within(list).findByRole("button", {
        name: /Повторить/,
      });
      expect(nameInput(group(/Редактирование категории/)).value).toBe(
        "Мой черновик",
      );
      expect(
        within(list).getByText(category().name, { exact: true }),
      ).not.toBeNull();
      expect(
        queryClient.getQueryData(categoryKeys.list(42, { type: "expense" })),
      ).toEqual([category()]);
      failed = false;
      refreshed = true;
      holdNextRead = true;
      fireEvent.click(retry);
      await waitFor(() => expect(nextRead.heldCount).toBe(1));
      expect(nameInput(group(/Редактирование категории/)).value).toBe(
        "Мой черновик",
      );
      expect(within(list).queryByRole("status")).toBeNull();
      await act(async () => nextRead.release());
      await waitFor(() =>
        expect(
          within(list).queryByRole("button", { name: /Повторить/ }),
        ).toBeNull(),
      );
      expect(
        within(list).getByText("Обновлённая категория", { exact: true }),
      ).not.toBeNull();
      expect(nameInput(group(/Редактирование категории/)).value).toBe(
        "Мой черновик",
      );
    },
  );

  it("finishes a guarded create before background GET and preserves a failed draft", async () => {
    let write = new ResponseGate();
    const refresh = new ResponseGate();
    let failWrite = true;
    let holdReads = false;
    const calls = installApi(async (call) => {
      if (call.method === "GET") {
        if (holdReads) await refresh.wait();
        return Response.json([category()]);
      }
      await write.wait();
      return failWrite
        ? Response.json(
            {
              statusCode: 400,
              code: "CREATE_FAILED",
              message: "Создание отклонено",
            },
            { status: 400 },
          )
        : Response.json({ ...category(), id: 9, name: "Новая" });
    });
    renderPage();
    await readyCategory();
    const creation = group("Создание новой категории");
    fireEvent.change(nameInput(creation), { target: { value: "Новая" } });
    submit(creation, true);
    await waitFor(() => expect(write.heldCount).toBe(1));
    expect(calls.filter((call) => call.method === "POST")).toHaveLength(1);
    expect(creation.disabled).toBe(true);
    expect(group("Удаление категории").disabled).toBe(false);
    await act(async () => write.release());
    await within(creation).findByText(/Создание отклонено/);
    expect(nameInput(creation).value).toBe("Новая");
    expect(creation.disabled).toBe(false);

    write = new ResponseGate();
    failWrite = false;
    holdReads = true;
    submit(creation);
    await waitFor(() => expect(write.heldCount).toBe(1));
    await act(async () => write.release());
    await waitFor(() => expect(refresh.heldCount).toBe(1));
    await waitFor(() => expect(nameInput(creation).value).toBe(""));
    expect(creation.disabled).toBe(false);
    expect(calls.filter((call) => call.method === "POST")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "доходы" }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("finishes a guarded edit before background GET and retains its failed draft", async () => {
    let write = new ResponseGate();
    const refresh = new ResponseGate();
    let failWrite = true;
    let holdReads = false;
    const calls = installApi(async (call) => {
      if (call.method === "GET") {
        if (holdReads) await refresh.wait();
        return Response.json([category()]);
      }
      await write.wait();
      return failWrite
        ? Response.json(
            { statusCode: 400, code: "EDIT_FAILED" },
            { status: 400 },
          )
        : Response.json({ ...category(), name: "Переименовано" });
    });
    renderPage();
    fireEvent.click(await readyCategory());
    const editor = group(/Редактирование категории/);
    fireEvent.change(nameInput(editor), { target: { value: "Переименовано" } });
    submit(editor, true);
    await waitFor(() => expect(write.heldCount).toBe(1));
    expect(calls.filter((call) => call.method === "PATCH")).toHaveLength(1);
    expect(editor.disabled).toBe(true);
    expect(group("Создание новой категории").disabled).toBe(false);
    await act(async () => write.release());
    await within(editor).findByText(/Не удалось сохранить категорию/);
    expect(nameInput(editor).value).toBe("Переименовано");
    expect(editor.disabled).toBe(false);

    write = new ResponseGate();
    failWrite = false;
    holdReads = true;
    submit(editor);
    await waitFor(() => expect(write.heldCount).toBe(1));
    await act(async () => write.release());
    await waitFor(() => expect(refresh.heldCount).toBe(1));
    await waitFor(() =>
      expect(
        screen.queryByRole("group", { name: /Редактирование категории/ }),
      ).toBeNull(),
    );
    expect(calls.filter((call) => call.method === "PATCH")).toHaveLength(2);
  });

  it("guards delete, retains a failed selection and finishes before background GET", async () => {
    let write = new ResponseGate();
    const refresh = new ResponseGate();
    let failWrite = true;
    let holdReads = false;
    const calls = installApi(async (call) => {
      if (call.method === "GET") {
        if (holdReads) await refresh.wait();
        return Response.json([category()]);
      }
      await write.wait();
      return failWrite
        ? Response.json(
            {
              statusCode: 400,
              code: "DELETE_FAILED",
              message: "Удаление отклонено",
            },
            { status: 400 },
          )
        : new Response(null, { status: 204 });
    });
    renderPage();
    await readyCategory();
    const deletion = group("Удаление категории");
    fireEvent.change(select(deletion), { target: { value: "3" } });
    submit(deletion, true);
    await waitFor(() => expect(write.heldCount).toBe(1));
    expect(calls.filter((call) => call.method === "DELETE")).toHaveLength(1);
    expect(
      within(deletion)
        .getByRole("button", { name: /Удал/ })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(group("Создание новой категории").disabled).toBe(false);
    await act(async () => write.release());
    await within(deletion).findByText(/Удаление отклонено|Не удалось удалить/);
    expect(select(deletion).value).toBe("3");

    write = new ResponseGate();
    failWrite = false;
    holdReads = true;
    submit(deletion);
    await waitFor(() => expect(write.heldCount).toBe(1));
    await act(async () => write.release());
    await waitFor(() => expect(refresh.heldCount).toBe(1));
    await waitFor(() => expect(select(deletion).value).toBe(""));
    expect(calls.filter((call) => call.method === "DELETE")).toHaveLength(2);
    expect(within(deletion).queryByRole("status")).toBeNull();
  });

  it.each(["account", "type"] as const)(
    "ends the old draft lifetime on %s change without clearing the new draft after late success",
    async (context) => {
      const write = new ResponseGate();
      const calls = installApi(async (call) => {
        if (call.method === "GET")
          return Response.json([
            category(
              call.accountId,
              call.type === "income" ? "income" : "expense",
            ),
          ]);
        await write.wait();
        return Response.json({ ...category(), id: 9, name: "Старый черновик" });
      });
      renderPage();
      await readyCategory();
      fireEvent.change(nameInput(group("Создание новой категории")), {
        target: { value: "Старый черновик" },
      });
      submit(group("Создание новой категории"));
      await waitFor(() => expect(write.heldCount).toBe(1));
      if (context === "account") act(() => switchAccount(43));
      else fireEvent.click(screen.getByRole("button", { name: "доходы" }));
      const nextCategory =
        context === "account" ? category(43) : category(42, "income");
      await screen.findByRole("button", {
        name: `Изменить категорию ${nextCategory.name}`,
      });
      const creation = group("Создание новой категории");
      expect(nameInput(creation).value).toBe("");
      expect(creation.disabled).toBe(false);
      fireEvent.change(nameInput(creation), {
        target: { value: "Новый черновик" },
      });
      await act(async () => write.release());
      await waitFor(() => expect(queryClient.isMutating()).toBe(0));
      expect(nameInput(group("Создание новой категории")).value).toBe(
        "Новый черновик",
      );
      expect(calls.filter((call) => call.method === "POST")).toEqual([
        {
          method: "POST",
          accountId: 42,
          categoryId: undefined,
          type: null,
          body: { name: "Старый черновик", type: "expense", iconKey: null },
        },
      ]);
    },
  );

  it("discards editor and delete selection when switching accounts", async () => {
    installApi();
    renderPage();
    fireEvent.click(await readyCategory());
    fireEvent.change(nameInput(group(/Редактирование категории/)), {
      target: { value: "Черновик A" },
    });
    fireEvent.change(select(group("Удаление категории")), {
      target: { value: "3" },
    });
    act(() => switchAccount(43));
    await readyCategory(43);
    expect(
      screen.queryByRole("group", { name: /Редактирование категории/ }),
    ).toBeNull();
    expect(select(group("Удаление категории")).value).toBe("");
    act(() => switchAccount(42));
    await readyCategory();
    expect(
      screen.queryByRole("group", { name: /Редактирование категории/ }),
    ).toBeNull();
    expect(select(group("Удаление категории")).value).toBe("");
  });

  it("does not show a late read from the previous account during an A to B to A switch", async () => {
    const firstRead = new ResponseGate();
    let holdFirst = true;
    installApi(async (call) => {
      if (call.accountId === 42 && holdFirst) await firstRead.wait();
      return Response.json([category(call.accountId)]);
    });
    renderPage();
    await waitFor(() => expect(firstRead.heldCount).toBe(1));
    act(() => switchAccount(43));
    await readyCategory(43);
    holdFirst = false;
    await act(async () => firstRead.release());
    expect(
      screen.queryByRole("button", {
        name: `Изменить категорию ${category().name}`,
      }),
    ).toBeNull();
    expect(select(group("Удаление категории")).options[1]?.textContent).toBe(
      category(43).name,
    );
    act(() => switchAccount(42));
    await readyCategory();
    expect(
      screen.queryByRole("button", {
        name: `Изменить категорию ${category(43).name}`,
      }),
    ).toBeNull();
  });

  it("keeps the new account editor open when an old account save completes", async () => {
    const write = new ResponseGate();
    installApi(async (call) => {
      if (call.method === "GET")
        return Response.json([category(call.accountId)]);
      await write.wait();
      return Response.json({ ...category(), name: "Позднее имя A" });
    });
    renderPage();
    fireEvent.click(await readyCategory());
    fireEvent.change(nameInput(group(/Редактирование категории/)), {
      target: { value: "Позднее имя A" },
    });
    submit(group(/Редактирование категории/));
    await waitFor(() => expect(write.heldCount).toBe(1));
    act(() => switchAccount(43));
    fireEvent.click(await readyCategory(43));
    fireEvent.change(nameInput(group(/Редактирование категории/)), {
      target: { value: "Черновик B" },
    });
    await act(async () => write.release());
    await waitFor(() => expect(queryClient.isMutating()).toBe(0));
    expect(nameInput(group(/Редактирование категории/)).value).toBe(
      "Черновик B",
    );
  });

  it("keeps the new account delete selection when an old delete completes", async () => {
    const write = new ResponseGate();
    installApi(async (call) => {
      if (call.method === "GET")
        return Response.json([category(call.accountId)]);
      await write.wait();
      return new Response(null, { status: 204 });
    });
    renderPage();
    await readyCategory();
    fireEvent.change(select(group("Удаление категории")), {
      target: { value: "3" },
    });
    submit(group("Удаление категории"));
    await waitFor(() => expect(write.heldCount).toBe(1));
    act(() => switchAccount(43));
    await readyCategory(43);
    fireEvent.change(select(group("Удаление категории")), {
      target: { value: "5" },
    });
    await act(async () => write.release());
    await waitFor(() => expect(queryClient.isMutating()).toBe(0));
    expect(select(group("Удаление категории")).value).toBe("5");
  });

  it("does not refill private category cache when an old write completes after leaving the session", async () => {
    const write = new ResponseGate();
    const calls = installApi(async (call) => {
      if (call.method === "GET") return Response.json([category()]);
      await write.wait();
      return Response.json({ ...category(), id: 9, name: "Поздняя" });
    });
    const page = renderPage();
    await readyCategory();
    fireEvent.change(nameInput(group("Создание новой категории")), {
      target: { value: "Поздняя" },
    });
    submit(group("Создание новой категории"));
    await waitFor(() => expect(write.heldCount).toBe(1));
    const pendingMutation = queryClient.getMutationCache().getAll()[0];
    page.unmount();
    queryClient.clear();
    await act(async () => write.release());
    await waitFor(() => expect(pendingMutation?.state.status).toBe("success"));
    expect(
      queryClient.getQueryCache().findAll({ queryKey: categoryKeys.all(42) }),
    ).toHaveLength(0);
    expect(calls.filter((call) => call.method === "GET")).toHaveLength(1);
  });

  it("renders a terminal disabled state without an account or placeholder GET", () => {
    queryClient.setQueryData(getAuthMeQueryKey(), { userId: 1, accounts: [] });
    const calls = installApi();
    renderPage();
    expect(screen.queryByRole("status", { name: /Загрузка/ })).toBeNull();
    expect(screen.getAllByText(/Счёт не выбран/).length).toBeGreaterThan(0);
    expect(
      within(group("Создание новой категории"))
        .getByRole("button", { name: "Создать" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      within(group("Удаление категории"))
        .getByRole("button", { name: "Удалить" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(calls).toHaveLength(0);
  });
});
