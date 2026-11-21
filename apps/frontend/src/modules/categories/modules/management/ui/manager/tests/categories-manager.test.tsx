import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApiRuntime } from "@/common/api/api-runtime";
import { ApiRuntimeContext } from "@/common/api/api-runtime-context";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import type { CategoryDTO } from "@/common/api/generate/model";

import { CategoriesManager } from "../../../index";

let runtime: ReturnType<typeof createApiRuntime>;
let queryClient: ReturnType<typeof createApiRuntime>["queryClient"];

vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    notifications: [],
    addNotification: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

const EXPENSE: CategoryDTO = {
  id: 3,
  accountId: 42,
  type: "expense",
  name: "Покупки",
  iconKey: "groceries",
};
const INCOME: CategoryDTO = {
  id: 9,
  accountId: 42,
  type: "income",
  name: "Зарплата",
  iconKey: null,
};

const wrapper = ({ children }: PropsWithChildren) => (
  <ApiRuntimeContext.Provider value={runtime}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </ApiRuntimeContext.Provider>
);

beforeEach(() => {
  runtime = createApiRuntime({
    fetch: (input, init) => globalThis.fetch(input, init),
    notifyError: () => {},
  });
  queryClient = runtime.queryClient;
  queryClient.clear();
  window.localStorage.clear();
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
});

afterEach(() => {
  cleanup();
  runtime.dispose();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("CategoriesManager", () => {
  it("preserves same-type drafts and resets forms and selection when the type changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = new URL(String(input), "http://localhost");
        return Promise.resolve(
          Response.json(
            url.searchParams.get("type") === "income" ? [INCOME] : [EXPENSE],
          ),
        );
      }),
    );
    const onCategoryUpdated = vi.fn();
    const view = render(
      <CategoriesManager
        type="expense"
        onCategoryUpdated={onCategoryUpdated}
      />,
      { wrapper },
    );
    await screen.findByRole("button", { name: "Изменить категорию Покупки" });
    const create = within(
      screen.getByRole("group", {
        name: "Создание новой категории",
      }),
    );
    fireEvent.change(create.getByLabelText("Наименование категории"), {
      target: { value: "Черновик создания" },
    });
    fireEvent.click(create.getByRole("button", { name: "Такси" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Изменить категорию Покупки" }),
    );
    const editor = within(
      screen.getByRole("group", { name: "Редактирование категории Покупки" }),
    );
    fireEvent.change(editor.getByLabelText("Наименование категории"), {
      target: { value: "Черновик редактирования" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Категория" }), {
      target: { value: String(EXPENSE.id) },
    });

    view.rerender(
      <CategoriesManager
        type="expense"
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
    expect(create.getByLabelText("Наименование категории")).toHaveProperty(
      "value",
      "Черновик создания",
    );
    expect(editor.getByLabelText("Наименование категории")).toHaveProperty(
      "value",
      "Черновик редактирования",
    );
    expect(screen.getByRole("combobox", { name: "Категория" })).toHaveProperty(
      "value",
      String(EXPENSE.id),
    );

    view.rerender(
      <CategoriesManager type="income" onCategoryUpdated={onCategoryUpdated} />,
    );
    await screen.findByRole("button", { name: "Изменить категорию Зарплата" });
    expect(
      screen.queryByRole("group", { name: /Редактирование категории/ }),
    ).toBeNull();
    const incomeCreate = within(
      screen.getByRole("group", {
        name: "Создание новой категории",
      }),
    );
    expect(
      incomeCreate.getByLabelText("Наименование категории"),
    ).toHaveProperty("value", "");
    expect(
      incomeCreate
        .getByRole("button", { name: "Без иконки" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("combobox", { name: "Категория" })).toHaveProperty(
      "value",
      "",
    );

    view.rerender(
      <CategoriesManager
        type="expense"
        onCategoryUpdated={onCategoryUpdated}
      />,
    );
    await screen.findByRole("button", { name: "Изменить категорию Покупки" });
    expect(
      screen.queryByRole("group", { name: /Редактирование категории/ }),
    ).toBeNull();
    expect(
      within(
        screen.getByRole("group", {
          name: "Создание новой категории",
        }),
      ).getByLabelText("Наименование категории"),
    ).toHaveProperty("value", "");
    expect(screen.getByRole("combobox", { name: "Категория" })).toHaveProperty(
      "value",
      "",
    );
  });

  it("reports the renamed category scope through its public callback", async () => {
    let category = EXPENSE;
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input), "http://localhost");
        if (init?.method === "PATCH") {
          expect(url.pathname).toBe("/api/v1/accounts/42/categories/3");
          expect(JSON.parse(String(init.body))).toEqual({
            name: "Новое имя",
            iconKey: "groceries",
          });
          category = { ...category, name: "Новое имя" };
          return Promise.resolve(Response.json(category));
        }
        return Promise.resolve(Response.json([category]));
      }),
    );
    const onCategoryUpdated = vi.fn();
    render(
      <CategoriesManager
        type="expense"
        onCategoryUpdated={onCategoryUpdated}
      />,
      { wrapper },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Изменить категорию Покупки" }),
    );
    const editor = within(
      screen.getByRole("group", { name: "Редактирование категории Покупки" }),
    );
    fireEvent.change(editor.getByLabelText("Наименование категории"), {
      target: { value: "  Новое имя  " },
    });
    fireEvent.click(editor.getByRole("button", { name: "Сохранить" }));

    await waitFor(() =>
      expect(onCategoryUpdated).toHaveBeenCalledWith({
        accountId: 42,
        categoryId: 3,
      }),
    );
    expect(
      await screen.findByRole("button", {
        name: "Изменить категорию Новое имя",
      }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.queryByRole("group", { name: /Редактирование категории/ }),
      ).toBeNull(),
    );
  });
});
