import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { transactionKeys } from "@/modules/transactions/model/transaction-keys";

import { useCreateTransaction } from "../use-create-transaction.ts";

// Regression-тест перенесён из
// projects/tasks/cache-isolation-review/sessions/2026-10-24-src-review/evidence/races.test.tsx:
// снапшот счёта обязан принадлежать вызову мутации (контекст onMutate), а не
// hook-экземпляру — иначе поздний ответ первой мутации использует скоп второй.
// Код приложения не мокируется: подменяются только HTTP (fetch) и уведомления
vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

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
  // Скоп первой мутации — её собственный снапшот (42): поддерево 42
  // инвалидировано, поддерево 43 ещё нет (вторая мутация в полёте)
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
