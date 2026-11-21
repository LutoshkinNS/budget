import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/common/api/api-error";
import { createAppQueryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { useNotifications } from "@/common/lib/notifications";
import { NotificationsTestRoot } from "@/common/lib/notifications/tests/notifications-test-root";

import { useDeleteTransaction } from "../use-delete-transaction";

const FAILURE = {
  statusCode: 403,
  message: "Недостаточно прав для удаления операции.",
} as const;
const TITLE = "Не удалось удалить операцию";
const TRANSACTION_ID = 7;
const clients: ReturnType<typeof createAppQueryClient>[] = [];
let client: ReturnType<typeof createAppQueryClient>;

beforeEach(() => {
  client = createAppQueryClient(() => {});
  clients.push(client);
  client.setQueryData(getAuthMeQueryKey(), {
    userId: 1,
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
  });
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach((entry) => entry.clear());
  vi.unstubAllGlobals();
});

function wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={client}>
      <NotificationsTestRoot>{children}</NotificationsTestRoot>
    </QueryClientProvider>
  );
}

describe("transaction delete API error feedback", () => {
  it("shows one human title and the server message without requiring a business code", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json(FAILURE, { status: FAILURE.statusCode }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(
      () => ({
        mutation: useDeleteTransaction(),
        notifications: useNotifications(),
      }),
      { wrapper },
    );
    let failure: unknown;
    await act(async () => {
      failure = await result.current.mutation
        .deleteTransaction(TRANSACTION_ID)
        .catch((error: unknown) => error);
    });
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject(FAILURE);
    expect(result.current.notifications.notifications).toEqual([
      expect.objectContaining({ title: TITLE, message: FAILURE.message }),
    ]);
    expect(result.current.mutation.isError).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `/api/v1/accounts/42/transactions/${TRANSACTION_ID}`,
    );
  });
});
