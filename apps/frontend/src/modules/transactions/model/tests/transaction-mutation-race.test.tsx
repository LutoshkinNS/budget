import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { transactionKeys } from "@/modules/transactions/model/transaction-keys";

import { useCreateTransaction } from "../use-create-transaction.ts";

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

// Каждый ответ инвалидирует счёт своего вызова из variables.
const RANGE = { from: "2026-10-01", to: "2026-10-02" };
const DATA = { type: "expense", amount: 10, categoryId: 3 } as const;
const me = (currentAccountId: number) => ({
  accounts: [
    { id: currentAccountId, name: "Счёт", initialBalance: 0, isOwner: true },
  ],
  userId: 1,
});

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => queryClient.clear());
afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

it("keeps each concurrent mutation's original account scope", async () => {
  const pending: Array<() => void> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          pending.push(() => resolve(Response.json({ id: 1 })));
        }),
    ),
  );
  queryClient.setQueryData(getAuthMeQueryKey(), me(42));
  queryClient.setQueryData(transactionKeys.list(42, RANGE), []);
  queryClient.setQueryData(transactionKeys.list(43, RANGE), []);
  const { result } = renderHook(useCreateTransaction, { wrapper });
  const first: { promise?: Promise<unknown> } = {};
  const second: { promise?: Promise<unknown> } = {};
  act(() => {
    first.promise = result.current.createTransaction(DATA);
  });
  await waitFor(() => expect(pending).toHaveLength(1));
  act(() => {
    queryClient.setQueryData(getAuthMeQueryKey(), me(43));
  });
  act(() => {
    second.promise = result.current.createTransaction(DATA);
  });
  await waitFor(() => expect(pending).toHaveLength(2));
  await act(async () => {
    pending[0]?.();
    await first.promise;
  });
  const firstAccountInvalidated = queryClient.getQueryState(
    transactionKeys.list(42, RANGE),
  )?.isInvalidated;
  const secondAccountInvalidated = queryClient.getQueryState(
    transactionKeys.list(43, RANGE),
  )?.isInvalidated;
  await act(async () => {
    pending[1]?.();
    await second.promise;
  });
  expect({ firstAccountInvalidated, secondAccountInvalidated }).toEqual({
    firstAccountInvalidated: true,
    secondAccountInvalidated: false,
  });
});
