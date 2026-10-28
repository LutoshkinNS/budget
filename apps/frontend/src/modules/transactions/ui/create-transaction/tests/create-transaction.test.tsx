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

import { CreateTransaction } from "../create-transaction.tsx";

vi.mock(import("@/common/lib/notifications"), () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

const ME = {
  accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
  userId: 1,
};
const CATEGORIES = [
  { id: 3, accountId: 42, type: "expense", name: "Еда", iconKey: null },
];

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Сумма "0" не проходит валидацию POST, поэтому перед выбором категории
// вводится цифра на клавиатуре суммы.
function typeAmount() {
  fireEvent.click(screen.getByRole("button", { name: "5" }));
}

const pendingPosts: Array<() => void> = [];
let postShouldFail = false;

function stubHttp() {
  const posts: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      if (init?.method === "POST") {
        posts.push(url.pathname);
        return new Promise<Response>((resolve) => {
          pendingPosts.push(() =>
            postShouldFail
              ? resolve(
                  Response.json(
                    { code: "SERVER_ERROR", statusCode: 500 },
                    { status: 500 },
                  ),
                )
              : resolve(Response.json({ id: 7 })),
          );
        });
      }
      if (url.pathname.endsWith("/categories")) {
        return Promise.resolve(Response.json(CATEGORIES));
      }
      return Promise.resolve(Response.json([]));
    }),
  );
  return posts;
}

beforeEach(() => {
  queryClient.clear();
  window.localStorage.clear();
  postShouldFail = false;
});
afterEach(async () => {
  await act(async () => pendingPosts.splice(0).forEach((release) => release()));
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("CreateTransaction local save feedback", () => {
  it("sends one POST when the category is clicked twice before a rerender", async () => {
    const posts = stubHttp();
    queryClient.setQueryData(getAuthMeQueryKey(), ME);
    render(<CreateTransaction />, { wrapper });

    const card = await screen.findByRole("button", { name: "Еда" });
    typeAmount();
    // Оба события до перерисовки: guard блокирует второй submit.
    fireEvent.click(card);
    fireEvent.click(card);
    await waitFor(() => expect(posts).toHaveLength(1));
    await act(async () => pendingPosts.splice(0).forEach((release) => release()));
    expect(posts).toHaveLength(1);
  });

  it("freezes the form while the POST is in flight", async () => {
    stubHttp();
    queryClient.setQueryData(getAuthMeQueryKey(), ME);
    render(<CreateTransaction />, { wrapper });

    const card = await screen.findByRole("button", { name: "Еда" });
    typeAmount();
    fireEvent.click(card);
    await waitFor(() => expect(pendingPosts).toHaveLength(1));
    expect(card.matches(":disabled")).toBe(true);
    expect(
      screen.getByPlaceholderText("добавить комментарий").matches(":disabled"),
    ).toBe(true);

    await act(async () => pendingPosts.splice(0).forEach((release) => release()));
    await waitFor(() => expect(card.matches(":disabled")).toBe(false));
  });

  it("keeps the draft after a failed save and allows a retry", async () => {
    const posts = stubHttp();
    queryClient.setQueryData(getAuthMeQueryKey(), ME);
    render(<CreateTransaction />, { wrapper });

    const card = await screen.findByRole("button", { name: "Еда" });
    const comment = screen.getByPlaceholderText(
      "добавить комментарий",
    ) as HTMLInputElement;
    fireEvent.change(comment, { target: { value: "кофе" } });
    typeAmount();

    // Первый POST падает: ввод сохраняется для повторной отправки.
    postShouldFail = true;
    fireEvent.click(card);
    await waitFor(() => expect(pendingPosts).toHaveLength(1));
    await act(async () => pendingPosts.splice(0).forEach((release) => release()));
    await screen.findByRole("alert");
    expect(comment.value).toBe("кофе");

    // Повторная отправка успешна: ввод очищается после ответа.
    postShouldFail = false;
    fireEvent.click(card);
    await waitFor(() => expect(posts).toHaveLength(2));
    await act(async () => pendingPosts.splice(0).forEach((release) => release()));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(
      (screen.getByPlaceholderText("добавить комментарий") as HTMLInputElement)
        .value,
    ).toBe("");
  });
});
