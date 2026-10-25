import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";

import { categoryKeys } from "../category-keys";
import { useUpdateCategory } from "../use-update-category";

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

it("invalidates own cache after renaming and reports the scope to the composer", async () => {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
  const keys = [
    categoryKeys.list(42, { type: "expense" }),
    categoryKeys.list(42, { type: "income" }),
    categoryKeys.detail(42, 3),
  ];
  for (const key of keys) queryClient.setQueryData(key, []);
  queryClient.setQueryData(["unrelated"], []);
  const onCategoryUpdated = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 3, name: "Новое имя" }), {
        status: 200,
      }),
    ),
  );
  const { result } = renderHook(() => useUpdateCategory({ onCategoryUpdated }), {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  await act(async () => {
    await result.current.mutateAsync({
      categoryId: 3,
      data: { name: "Новое имя" },
    });
  });
  for (const key of keys)
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  expect(onCategoryUpdated).toHaveBeenCalledWith({
    accountId: 42,
    categoryId: 3,
  });
});

it("awaits the composer callback before resolving the mutation scenario", async () => {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
  let resolveCallback: () => void = () => {};
  const callbackDone = new Promise<void>(
    (resolve) => (resolveCallback = resolve),
  );
  const onCategoryUpdated = vi.fn(() => callbackDone);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 3, name: "Новое имя" }), {
        status: 200,
      }),
    ),
  );
  const { result } = renderHook(() => useUpdateCategory({ onCategoryUpdated }), {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  let scenarioDone = false;
  await act(async () => {
    let settleMutation!: () => void;
    const mutationSettled = new Promise<void>(
      (resolve) => (settleMutation = resolve),
    );
    result.current.mutateAsync({
      categoryId: 3,
      data: { name: "Новое имя" },
    }).then(() => {
      scenarioDone = true;
      settleMutation();
    });
    await waitFor(() => expect(onCategoryUpdated).toHaveBeenCalled());
    expect(scenarioDone).toBe(false);
    resolveCallback();
    await mutationSettled;
  });
  expect(scenarioDone).toBe(true);
});

it("works without a callback: only the own cache is invalidated", async () => {
  queryClient.setQueryData(getAuthMeQueryKey(), {
    accounts: [{ id: 42, name: "Счёт", initialBalance: 0, isOwner: true }],
    userId: 1,
  });
  queryClient.setQueryData(categoryKeys.list(42), []);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 3, name: "Новое имя" }), {
        status: 200,
      }),
    ),
  );
  const { result } = renderHook(() => useUpdateCategory(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  await act(async () => {
    await result.current.mutateAsync({
      categoryId: 3,
      data: { name: "Новое имя" },
    });
  });
  expect(
    queryClient.getQueryState(categoryKeys.list(42))?.isInvalidated,
  ).toBe(true);
});
