import { type PropsWithChildren, useState } from "react";
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

import { queryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import {
  invalidateTransactionsCategorySummary,
  invalidateTransactionsList,
} from "@/modules/transactions";
import { switchAccount } from "@/modules/user";

import { Reports } from "../reports.tsx";
import type { ReportsSearch } from "../route.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

const SEARCH: ReportsSearch = {
  period: "range",
  type: "expense",
  month: "2026-10",
  fromDate: "2026-10-01",
  toDate: "2026-10-20",
};
const SUMMARY = {
  totalAmount: 300,
  previousTotalAmount: 200,
  changePercent: 50,
  transactionCount: 2,
  categories: [
    {
      categoryId: 3,
      categoryName: "Продукты",
      amount: 100,
      percentage: 33,
      previousAmount: 80,
      changePercent: 25,
      transactionCount: 1,
    },
    {
      categoryId: 4,
      categoryName: "Транспорт",
      amount: 200,
      percentage: 67,
      previousAmount: 120,
      changePercent: 66,
      transactionCount: 1,
    },
  ],
};
const OPERATIONS = [
  {
    id: 101,
    accountId: 42,
    amount: 100,
    categoryId: 3,
    userId: 1,
    type: "expense",
    description: "Покупка яблок",
    date: "2026-10-05T09:00:00.000Z",
  },
];

function barrier() {
  let release: (response: Response) => void = () => {};
  const promise = new Promise<Response>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

function seedAccount(accountId: number | undefined) {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
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

function http(
  respond: (
    kind: "summary" | "operations",
    url: URL,
  ) => Response | Promise<Response>,
) {
  const calls: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      calls.push(url);
      if (url.pathname.endsWith("category-summary"))
        return respond("summary", url);
      if (url.pathname.endsWith("transactions"))
        return respond("operations", url);
      throw new Error(`Unexpected request: ${url}`);
    }),
  );
  return calls;
}

function SearchHarness({ initial = SEARCH }: { initial?: ReportsSearch }) {
  const [search, setSearch] = useState(initial);
  return <Reports search={search} onSearchChange={setSearch} />;
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
  seedAccount(42);
});
afterEach(() => {
  cleanup();
  queryClient.clear();
  queryClient.setDefaultOptions(defaults);
  vi.unstubAllGlobals();
});

describe("reports local read regions", () => {
  it("allows the first deep link after initial account resolution", async () => {
    queryClient.clear();
    const auth = barrier();
    const calls: URL[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), "http://localhost");
        calls.push(url);
        if (url.pathname.endsWith("/auth/me")) return auth.promise;
        return Response.json(
          url.pathname.endsWith("category-summary") ? SUMMARY : OPERATIONS,
        );
      }),
    );
    const onSearchChange = vi.fn();
    const selectedSearch = { ...SEARCH, selectedCategoryId: 3 };
    const { rerender } = render(
      <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      { wrapper },
    );
    try {
      await waitFor(() => expect(calls).toHaveLength(1));
      expect(screen.queryByRole("dialog")).toBeNull();
      await act(async () =>
        auth.release(
          Response.json({
            userId: 1,
            accounts: [
              { id: 42, name: "Счёт A", initialBalance: 0, isOwner: true },
            ],
          }),
        ),
      );
      expect(
        await screen.findByRole("dialog", { name: "Продукты" }),
      ).toBeTruthy();
      expect(await screen.findByText("Покупка яблок")).toBeTruthy();
      expect(onSearchChange).not.toHaveBeenCalled();
      rerender(
        <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      );
      expect(screen.getByRole("dialog", { name: "Продукты" })).toBeTruthy();
    } finally {
      auth.release(Response.json({ userId: 1, accounts: [] }));
    }
  });

  it("keeps sheet closed across account A-B-A while search cleanup is delayed", async () => {
    const summaryB = {
      ...SUMMARY,
      categories: [
        { ...SUMMARY.categories[1], categoryName: "Категория счёта B" },
      ],
    };
    const lateB = barrier();
    const lateA = barrier();
    let warmB = true;
    let returningA = false;
    const calls = http((kind, url) => {
      if (url.pathname.includes("/43/")) {
        if (kind === "summary")
          return warmB ? Response.json(summaryB) : lateB.promise;
        return Response.json([
          {
            ...OPERATIONS[0],
            accountId: 43,
            categoryId: 4,
            description: "Операция счёта B",
          },
        ]);
      }
      if (kind === "summary" && returningA) return lateA.promise;
      return Response.json(kind === "summary" ? SUMMARY : OPERATIONS);
    });
    queryClient.setQueryData(getAuthMeQueryKey(), {
      userId: 1,
      accounts: [42, 43].map((id) => ({
        id,
        name: `Счёт ${id}`,
        initialBalance: 0,
        isOwner: true,
      })),
    });
    switchAccount(43);
    const warm = render(<Reports search={SEARCH} onSearchChange={vi.fn()} />, {
      wrapper,
    });
    await screen.findByRole("button", {
      name: "Открыть операции категории Категория счёта B",
    });
    warm.unmount();
    switchAccount(42);
    const selectedSearch = { ...SEARCH, selectedCategoryId: 3 };
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      { wrapper },
    );
    try {
      await screen.findByRole("dialog", { name: "Продукты" });
      await screen.findByText("Покупка яблок");
      warmB = false;
      act(() => switchAccount(43));
      await waitFor(() =>
        expect(onSearchChange).toHaveBeenCalledWith(SEARCH, { replace: true }),
      );
      await waitFor(() =>
        expect(
          calls.filter(
            (url) =>
              url.pathname.includes("/43/") &&
              url.pathname.endsWith("category-summary"),
          ),
        ).toHaveLength(2),
      );
      expect(screen.queryByRole("dialog")).toBeNull();
      act(() => {
        returningA = true;
        switchAccount(42);
      });
      await waitFor(() => expect(onSearchChange).toHaveBeenCalledTimes(2));
      await waitFor(() =>
        expect(
          calls.filter(
            (url) =>
              url.pathname.includes("/42/") &&
              url.pathname.endsWith("category-summary"),
          ),
        ).toHaveLength(2),
      );
      rerender(
        <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      );
      expect(screen.queryByRole("dialog")).toBeNull();
      fireEvent.click(
        screen.getByRole("button", {
          name: "Открыть операции категории Продукты",
        }),
      );
      expect(onSearchChange).toHaveBeenLastCalledWith(selectedSearch);
      rerender(
        <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      );
      expect(screen.getByRole("dialog", { name: "Продукты" })).toBeTruthy();
      rerender(
        <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      );
      expect(screen.getByRole("dialog", { name: "Продукты" })).toBeTruthy();
      rerender(<Reports search={SEARCH} onSearchChange={onSearchChange} />);
      expect(screen.queryByRole("dialog")).toBeNull();
      fireEvent.click(
        screen.getByRole("button", {
          name: "Открыть операции категории Продукты",
        }),
      );
      expect(onSearchChange).toHaveBeenLastCalledWith(selectedSearch);
      rerender(
        <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      );
      expect(screen.getByRole("dialog", { name: "Продукты" })).toBeTruthy();
      rerender(
        <Reports search={selectedSearch} onSearchChange={onSearchChange} />,
      );
      expect(screen.getByRole("dialog", { name: "Продукты" })).toBeTruthy();
    } finally {
      await act(async () => {
        lateB.release(Response.json(summaryB));
        lateA.release(Response.json(SUMMARY));
        switchAccount(42);
      });
    }
  });

  it("keeps sheet header and close visible on initial operations error and retries to empty success", async () => {
    let failed = true;
    const calls = http((kind) =>
      Response.json(kind === "summary" ? SUMMARY : failed ? { items: [] } : []),
    );
    render(<SearchHarness initial={{ ...SEARCH, selectedCategoryId: 3 }} />, {
      wrapper,
    });
    const sheet = await screen.findByRole("dialog", { name: "Продукты" });
    expect(await within(sheet).findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Не удалось загрузить операции."),
    );
    expect(
      within(sheet)
        .getByRole("button", { name: "Закрыть" })
        .hasAttribute("disabled"),
    ).toBe(false);
    expect(
      within(sheet).queryByText("Операций за этот период нет."),
    ).toBeNull();
    failed = false;
    fireEvent.click(within(sheet).getByRole("button", { name: "Повторить" }));
    expect(
      await within(sheet).findByText("Операций за этот период нет."),
    ).toBeTruthy();
    expect(within(sheet).queryByRole("alert")).toBeNull();
    expect(
      calls.filter((url) => url.pathname.endsWith("category-summary")),
    ).toHaveLength(1);
    expect(
      calls.filter((url) => url.pathname.endsWith("transactions")),
    ).toHaveLength(2);
  });

  it("keeps controls and sheet close usable while their reads wait", async () => {
    const summary = barrier();
    const operations = barrier();
    const calls = http((kind) =>
      kind === "summary" ? summary.promise : operations.promise,
    );
    render(<SearchHarness />, { wrapper });
    try {
      await waitFor(() => expect(calls).toHaveLength(1));
      const skeleton = screen.getByRole("status", { name: "Загрузка отчёта" });
      expect(screen.getByRole("heading", { name: "Отчёты" })).toBeTruthy();
      expect(
        screen.getByRole("tab", { name: "Доходы" }).hasAttribute("disabled"),
      ).toBe(false);
      expect(screen.getByLabelText("От").hasAttribute("disabled")).toBe(false);
      expect(skeleton.querySelector('[aria-hidden="true"]')).toBeTruthy();
      expect(skeleton.querySelector("button, input, [tabindex] ")).toBeNull();
      expect(
        screen.queryByRole("region", { name: "Сводка: Расходы" }),
      ).toBeNull();
      expect(screen.queryByText(/за выбранный период пока нет/)).toBeNull();
      await act(async () => summary.release(Response.json(SUMMARY)));
      fireEvent.click(
        await screen.findByRole("button", {
          name: "Открыть операции категории Продукты",
        }),
      );
      await waitFor(() => expect(calls).toHaveLength(2));
      const sheet = screen.getByRole("dialog", { name: "Продукты" });
      expect(
        within(sheet).getByRole("status", { name: "Загрузка операций" }),
      ).toBeTruthy();
      expect(
        screen.getByRole("region", { name: "Сводка: Расходы" }),
      ).toBeTruthy();
      fireEvent.click(within(sheet).getByRole("button", { name: "Закрыть" }));
      expect(screen.queryByRole("dialog")).toBeNull();
      await act(async () => operations.release(Response.json(OPERATIONS)));
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(calls).toHaveLength(2);
    } finally {
      summary.release(Response.json(SUMMARY));
      operations.release(Response.json(OPERATIONS));
    }
  });

  it.each(["server", "schema", "network"] as const)(
    "renders initial %s error and recovers through its Retry",
    async (mode) => {
      let failed = true;
      http(() => {
        if (!failed) return Response.json(SUMMARY);
        if (mode === "network") throw new TypeError("Network unavailable");
        return mode === "schema"
          ? Response.json({ categories: [] })
          : Response.json(
              { statusCode: 500, code: "REPORT_FAILED" },
              { status: 500 },
            );
      });
      render(<SearchHarness />, { wrapper });
      expect(await screen.findByRole("alert")).toHaveProperty(
        "textContent",
        expect.stringContaining("Не удалось загрузить отчёт."),
      );
      expect(
        screen.queryByRole("region", { name: "Сводка: Расходы" }),
      ).toBeNull();
      expect(screen.queryByText(/за выбранный период пока нет/)).toBeNull();
      failed = false;
      fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
      expect(
        await screen.findByRole("button", {
          name: "Открыть операции категории Продукты",
        }),
      ).toBeTruthy();
      expect(screen.queryByRole("alert")).toBeNull();
    },
  );

  it("shows valid zero/empty and no-account states without a loading or error", async () => {
    const calls = http(() =>
      Response.json({
        totalAmount: 0,
        previousTotalAmount: 0,
        changePercent: null,
        transactionCount: 0,
        categories: [],
      }),
    );
    render(<SearchHarness />, { wrapper });
    expect(
      await screen.findByText("Расходов за выбранный период пока нет."),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Сводка: Расходы" }).textContent,
    ).toContain("0 операций");
    expect(screen.queryByRole("alert")).toBeNull();
    act(() => seedAccount(undefined));
    expect(await screen.findByText("Счёт не выбран.")).toBeTruthy();
    expect(
      screen.queryByRole("region", { name: "Сводка: Расходы" }),
    ).toBeNull();
    expect(
      screen.queryByRole("status", { name: "Загрузка отчёта" }),
    ).toBeNull();
    expect(calls).toHaveLength(1);
  });

  it("retains report content and exposes progress while retrying a failed background read", async () => {
    let phase: "success" | "failure" | "held" = "success";
    const retry = barrier();
    const calls = http(() =>
      phase === "held"
        ? retry.promise
        : Response.json(phase === "success" ? SUMMARY : { categories: [] }),
    );
    render(<SearchHarness />, { wrapper });
    await screen.findByRole("button", {
      name: "Открыть операции категории Продукты",
    });
    phase = "failure";
    await act(async () => {
      await invalidateTransactionsCategorySummary(42);
    });
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Не удалось обновить отчёт."),
    );
    expect(
      screen.getByRole("button", {
        name: "Открыть операции категории Продукты",
      }),
    ).toBeTruthy();
    phase = "held";
    try {
      fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
      await waitFor(() => expect(calls).toHaveLength(3));
      expect(
        screen.getByRole("region", { name: "Сводка: Расходы" }),
      ).toBeTruthy();
      expect(await screen.findByText("Обновляем отчёт…")).toBeTruthy();
      await act(async () => retry.release(Response.json(SUMMARY)));
      await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    } finally {
      retry.release(Response.json(SUMMARY));
    }
  });

  it("retains cached operations through a failed refresh and retries them locally", async () => {
    let phase: "success" | "failure" | "held" = "success";
    const retry = barrier();
    const calls = http((kind) => {
      if (kind === "summary") return Response.json(SUMMARY);
      if (phase === "held") return retry.promise;
      return Response.json(phase === "success" ? OPERATIONS : { items: [] });
    });
    render(<SearchHarness initial={{ ...SEARCH, selectedCategoryId: 3 }} />, {
      wrapper,
    });
    await screen.findByText("Покупка яблок");
    phase = "failure";
    await act(async () => {
      await invalidateTransactionsList(42);
    });
    const sheet = screen.getByRole("dialog", { name: "Продукты" });
    expect(await within(sheet).findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Не удалось обновить операции."),
    );
    expect(within(sheet).getByText("Покупка яблок")).toBeTruthy();
    phase = "held";
    try {
      fireEvent.click(within(sheet).getByRole("button", { name: "Повторить" }));
      await waitFor(() =>
        expect(
          calls.filter((url) => url.pathname.endsWith("transactions")),
        ).toHaveLength(3),
      );
      expect(within(sheet).getByText("Обновляем операции…")).toBeTruthy();
      expect(within(sheet).getByText("Покупка яблок")).toBeTruthy();
      await act(async () => retry.release(Response.json([])));
      expect(
        await within(sheet).findByText("Операций за этот период нет."),
      ).toBeTruthy();
      expect(within(sheet).queryByRole("alert")).toBeNull();
    } finally {
      retry.release(Response.json([]));
    }
  });

  it("reuses fresh data on remount/reopen and resets selection on report context changes", async () => {
    const calls = http((kind) =>
      Response.json(kind === "summary" ? SUMMARY : OPERATIONS),
    );
    const first = render(<SearchHarness />, { wrapper });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Открыть операции категории Продукты",
      }),
    );
    await screen.findByText("Покупка яблок");
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Открыть операции категории Продукты",
      }),
    );
    expect(screen.getByText("Покупка яблок")).toBeTruthy();
    expect(
      screen.queryByRole("status", { name: "Загрузка операций" }),
    ).toBeNull();
    expect(calls).toHaveLength(2);
    first.unmount();
    render(<SearchHarness initial={{ ...SEARCH, selectedCategoryId: 3 }} />, {
      wrapper,
    });
    expect(screen.getByText("Покупка яблок")).toBeTruthy();
    expect(
      screen.queryByRole("status", { name: "Загрузка отчёта" }),
    ).toBeNull();
    expect(calls).toHaveLength(2);
    fireEvent.click(screen.getByRole("tab", { name: "Доходы" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await screen.findByRole("heading", { name: "Категории доходов" });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Открыть операции категории Продукты",
      }),
    );
    await screen.findByRole("dialog");
    fireEvent.change(screen.getByLabelText("От"), {
      target: { value: "2026-10-02" },
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("replaces a category immediately and ignores old operations after account and category switches", async () => {
    const old = barrier();
    const calls = http((kind, url) => {
      if (kind === "summary") return Response.json(SUMMARY);
      if (
        url.pathname.includes("/42/") &&
        url.searchParams.get("categoryId") === "3"
      )
        return old.promise;
      return Response.json([
        {
          ...OPERATIONS[0],
          id: 202,
          categoryId: 4,
          description: "Новый проезд",
        },
      ]);
    });
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <Reports
        search={{ ...SEARCH, selectedCategoryId: 3 }}
        onSearchChange={onSearchChange}
      />,
      { wrapper },
    );
    try {
      await screen.findByRole("dialog", { name: "Продукты" });
      await waitFor(() =>
        expect(
          calls.filter((url) => url.pathname.endsWith("transactions")),
        ).toHaveLength(1),
      );
      rerender(
        <Reports
          search={{ ...SEARCH, selectedCategoryId: 4 }}
          onSearchChange={onSearchChange}
        />,
      );
      expect(screen.getByRole("dialog", { name: "Транспорт" })).toBeTruthy();
      expect(await screen.findByText("Новый проезд")).toBeTruthy();
      await act(async () => old.release(Response.json(OPERATIONS)));
      expect(screen.queryByText("Покупка яблок")).toBeNull();
      expect(screen.getByRole("dialog", { name: "Транспорт" })).toBeTruthy();
      act(() => seedAccount(43));
      await waitFor(() =>
        expect(onSearchChange).toHaveBeenCalledWith(SEARCH, { replace: true }),
      );
      expect(screen.queryByRole("dialog")).toBeNull();
      rerender(<Reports search={SEARCH} onSearchChange={onSearchChange} />);
      act(() => seedAccount(42));
      expect(screen.queryByRole("dialog")).toBeNull();
    } finally {
      old.release(Response.json(OPERATIONS));
    }
  });
});
