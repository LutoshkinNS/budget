import { CancelledError, type QueryClient } from "@tanstack/react-query";
import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ERROR_KIND, ApiError } from "../api-error";
import { createAppQueryClient } from "../app-query";

import { deferred } from "./deferred";

const failure = new ApiError({
  kind: API_ERROR_KIND.http,
  statusCode: 400,
  message: "Ошибка запроса",
});
const onError = vi.fn();
let client: QueryClient;
beforeEach(() => {
  onError.mockReset();
  client = createAppQueryClient(onError);
});
afterEach(() => client.clear());

async function reject(
  error: unknown = failure,
  meta?: { queryErrorNotification: false },
) {
  await client.invalidateQueries({ queryKey: ["query"], refetchType: "none" });
  await client
    .fetchQuery({
      queryKey: ["query"],
      queryFn: () => Promise.reject(error),
      ...(meta && { meta }),
    })
    .catch(() => {});
}

describe("application query client policy", () => {
  it("keeps freshness and mutation retry defaults", () => {
    expect(client.getDefaultOptions().queries?.staleTime).toBe(60_000);
    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });

  it("keeps an initial error silent, then reports failure after a cached success", async () => {
    await reject();
    expect(onError).not.toHaveBeenCalled();
    await client.fetchQuery({
      queryKey: ["query"],
      queryFn: async () => "valid",
    });
    await client.refetchQueries({ queryKey: ["query"] });
    await reject();
    expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
    expect(client.getQueryData(["query"])).toBe("valid");
  });

  it.each([{ data: [] }, { data: null }, { data: 0 }, { data: false }])(
    "recognizes raw cached $data as successful data",
    async ({ data }) => {
      client.setQueryData(["query"], data);
      await reject();
      expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
      expect(client.getQueryData(["query"])).toEqual(data);
    },
  );

  it.each([new CancelledError(), new DOMException("Stopped", "AbortError")])(
    "ignores cancelled background execution %s",
    async (error) => {
      client.setQueryData(["query"], []);
      await reject(error);
      expect(onError).not.toHaveBeenCalled();
    },
  );

  it("honors explicit opt-out for cached queries", async () => {
    client.setQueryData(["query"], []);
    await reject(failure, { queryErrorNotification: false });
    expect(onError).not.toHaveBeenCalled();
  });

  it.each([400, 0, 401])(
    "reports ordinary status %s once without retry",
    async (statusCode) => {
      client.setQueryData(["query"], []);
      const queryFn = vi.fn(() => Promise.reject({ ...failure, statusCode }));
      await client.invalidateQueries({
        queryKey: ["query"],
        refetchType: "none",
      });
      await client.fetchQuery({ queryKey: ["query"], queryFn }).catch(() => {});
      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(1);
    },
  );

  it("waits for four terminal 500 failures and keeps recovered retries silent", async () => {
    client.setQueryData(["retry"], []);
    await client.invalidateQueries({
      queryKey: ["retry"],
      refetchType: "none",
    });
    const terminal = deferred<string>();
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockImplementationOnce(() => terminal.promise);
    const request = client
      .fetchQuery({ queryKey: ["retry"], queryFn, retryDelay: 0 })
      .catch(() => {});
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(4));
    expect(onError).not.toHaveBeenCalled();
    terminal.reject({ ...failure, statusCode: 500 });
    await request;
    expect(onError).toHaveBeenCalledTimes(1);
    client.setQueryData(["recovered"], []);
    await client.invalidateQueries({
      queryKey: ["recovered"],
      refetchType: "none",
    });
    const recovered = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ ...failure, statusCode: 500 })
      .mockResolvedValueOnce("recovered");
    await client.fetchQuery({
      queryKey: ["recovered"],
      queryFn: recovered,
      retryDelay: 0,
    });
    expect(recovered).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
