import { QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppQueryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { NotificationsTestRoot } from "@/common/lib/notifications/tests/notifications-test-root";

import { CreateCategoryForm } from "../create-category";

const CATEGORY_NAME = "Продукты";
const BUSINESS_CODE = "CATEGORY_ALREADY_EXISTS";
const CASES = [
  {
    statusCode: 409,
    message: "Категория уже существует.",
    code: BUSINESS_CODE,
    feedback: "Категория с таким названием уже существует",
  },
  {
    statusCode: 403,
    message: "Нет доступа к созданию категории.",
    feedback: "Нет доступа к созданию категории.",
  },
] as const;
let client: ReturnType<typeof createAppQueryClient>;

beforeEach(() => {
  client = createAppQueryClient(() => {});
  client.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
  });
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("create category native API feedback", () => {
  it.each(CASES)(
    "keeps one inline feedback for HTTP$statusCode with optional business code",
    async (scenario) => {
      const body = {
        statusCode: scenario.statusCode,
        message: scenario.message,
        ...("code" in scenario ? { code: scenario.code } : {}),
      };
      const fetchMock = vi.fn<typeof fetch>(async () =>
        Response.json(body, { status: scenario.statusCode }),
      );
      vi.stubGlobal("fetch", fetchMock);
      render(
        <QueryClientProvider client={client}>
          <NotificationsTestRoot>
            <CreateCategoryForm type="expense" />
          </NotificationsTestRoot>
        </QueryClientProvider>,
      );
      fireEvent.change(screen.getByLabelText("Наименование категории"), {
        target: { value: CATEGORY_NAME },
      });
      fireEvent.click(screen.getByRole("button", { name: "Создать" }));
      await waitFor(() =>
        expect(screen.getByRole("alert").textContent).toContain(
          scenario.feedback,
        ),
      );
      expect(screen.getAllByRole("alert")).toHaveLength(1);
      expect(screen.queryByText(BUSINESS_CODE)).toBeNull();
      expect(
        screen.queryByRole("button", { name: "×" }),
      ).toBeNull();
      expect(screen.getByLabelText("Наименование категории")).toHaveProperty("value", CATEGORY_NAME);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
});
