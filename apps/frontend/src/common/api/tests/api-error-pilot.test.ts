import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ERROR_KIND, ApiError } from "../api-error";
import type { ApiObservation } from "../api-observation";
import { createApiRuntime } from "../api-runtime";
import { fetcher } from "../fetcher";
import { CategoriesListResponse } from "../generate/categories/categories.zod.gen";

import { deferred } from "./deferred";

const failure = {
  message: "Некорректные параметры запроса.",
  statusCode: 400,
};
const categories = [
  { id: 3, accountId: 42, type: "expense", name: "Продукты", iconKey: null },
];
const runtimes: ReturnType<typeof createApiRuntime>[] = [];

afterEach(() => {
  runtimes.splice(0).forEach((runtime) => runtime.dispose());
  vi.unstubAllGlobals();
});

describe("API error pilot runtime", () => {
  it.each([
    { status: 400, body: "pilot-private-malformed" },
    {
      status: 400,
      body: { ...failure, statusCode: 409, message: "pilot-private-mismatch" },
    },
    {
      status: 500,
      body: { ...failure, statusCode: 500, message: "pilot-private-technical" },
    },
  ])(
    "keeps HTTP$status authoritative and hides an untrusted body",
    async ({ status, body }) => {
      const runtime = createApiRuntime({
        fetch: vi.fn<typeof fetch>(async () => Response.json(body, { status })),
        notifyError: vi.fn(),
      });
      runtimes.push(runtime);
      const request = runtime.transport.requestValidated(
        "/api/v1/accounts/42/categories",
        { method: "GET", operation: "categoriesList" },
        CategoriesListResponse,
      );
      await expect(request).rejects.toBeInstanceOf(ApiError);
      await expect(request).rejects.toMatchObject({
        kind: API_ERROR_KIND.http,
        statusCode: status,
        message: "Не удалось выполнить запрос. Повторите попытку.",
      });
    },
  );

  it("rejects invalid JSON201 before replacing cached data and reports the real status", async () => {
    const events: ApiObservation[] = [];
    const notifyError = vi.fn();
    const runtime = createApiRuntime({
      fetch: vi.fn<typeof fetch>(
        async () => new Response("pilot-private-invalid-json", { status: 201 }),
      ),
      observe: (event) => {
        events.push(event);
      },
      notifyError,
    });
    runtimes.push(runtime);
    const queryKey = ["invalid-json"];
    runtime.queryClient.setQueryData(queryKey, categories);
    expect(events).toEqual([]);
    await runtime.queryClient.invalidateQueries({
      queryKey,
      refetchType: "none",
    });
    const request = runtime.queryClient.fetchQuery({
      queryKey,
      meta: { operation: "categoriesList" },
      queryFn: () =>
        runtime.transport.requestValidated(
          "/api/v1/accounts/42/categories",
          { method: "GET", operation: "categoriesList" },
          CategoriesListResponse,
        ),
    });
    await expect(request).rejects.toMatchObject({
      kind: API_ERROR_KIND.invalidResponse,
      statusCode: 201,
    });
    expect(runtime.queryClient.getQueryData(queryKey)).toEqual(categories);
    expect(events).toContainEqual({
      runtime: "frontend",
      event: "response-invalid",
      operation: "categoriesList",
      reason: "invalid-json",
      status: 201,
    });
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(events)).not.toContain("pilot-private-invalid-json");
  });

  it.each([false, true])(
    "distinguishes physical retry attempts from a terminal query (recovers=%s)",
    async (recovers) => {
      const events: ApiObservation[] = [];
      const notifyError = vi.fn();
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          Response.json({ statusCode: 500 }, { status: 500 }),
        )
        .mockImplementation(async () =>
          recovers
            ? Response.json(categories)
            : Response.json({ statusCode: 500 }, { status: 500 }),
        );
      const runtime = createApiRuntime({
        fetch: fetchMock,
        observe: (event) => {
          events.push(event);
        },
        notifyError,
      });
      runtimes.push(runtime);
      const queryKey = ["retry-counts"];
      runtime.queryClient.setQueryData(queryKey, categories);
      expect(events).toEqual([]);
      await runtime.queryClient.invalidateQueries({
        queryKey,
        refetchType: "none",
      });
      const request = runtime.queryClient.fetchQuery({
        queryKey,
        retryDelay: 0,
        meta: { operation: "categoriesList" },
        queryFn: () =>
          runtime.transport.requestValidated(
            "/api/v1/accounts/42/categories",
            { method: "GET", operation: "categoriesList" },
            CategoriesListResponse,
          ),
      });
      if (recovers) await expect(request).resolves.toEqual(categories);
      else await expect(request).rejects.toMatchObject({ statusCode: 500 });
      expect(fetchMock).toHaveBeenCalledTimes(recovers ? 2 : 4);
      expect(
        events.filter((event) => event.event === "http-completed"),
      ).toHaveLength(recovers ? 2 : 4);
      expect(
        events.filter((event) => event.event === "query-completed"),
      ).toEqual([
        {
          runtime: "frontend",
          event: "query-completed",
          operation: "categoriesList",
          result: recovers ? "success" : "error",
        },
      ]);
      expect(notifyError).toHaveBeenCalledTimes(recovers ? 0 : 1);
    },
  );

  it("silences a disposed pending runtime without leaking events or cache into the next root", async () => {
    const response = deferred<Response>();
    const eventsA: ApiObservation[] = [];
    const eventsB: ApiObservation[] = [];
    const notifyA = vi.fn();
    const notifyB = vi.fn();
    const fetchA = vi.fn<typeof fetch>(() => response.promise);
    const a = createApiRuntime({
      fetch: fetchA,
      observe: (event) => {
        eventsA.push(event);
      },
      notifyError: notifyA,
    });
    const b = createApiRuntime({
      fetch: vi.fn<typeof fetch>(async () => Response.json(categories)),
      observe: (event) => {
        eventsB.push(event);
      },
      notifyError: notifyB,
    });
    runtimes.push(a, b);
    const pending = a.transport
      .requestValidated(
        "/api/v1/accounts/43/categories",
        { method: "GET", operation: "categoriesList" },
        CategoriesListResponse,
      )
      .catch((error: unknown) => error);
    await waitFor(() => expect(fetchA).toHaveBeenCalledTimes(1));
    a.dispose();
    const queryKey = ["root-isolation"];
    await b.queryClient.fetchQuery({
      queryKey,
      meta: { operation: "categoriesList" },
      queryFn: () =>
        b.transport.requestValidated(
          "/api/v1/accounts/42/categories",
          { method: "GET", operation: "categoriesList" },
          CategoriesListResponse,
        ),
    });
    const beforeB = [...eventsB];
    response.resolve(Response.json(failure, { status: 400 }));
    expect(await pending).toBeInstanceOf(ApiError);
    expect(eventsA).toEqual([]);
    expect(eventsB).toEqual(beforeB);
    expect(beforeB).toHaveLength(2);
    expect(b.queryClient.getQueryData(queryKey)).toEqual(categories);
    expect(a.queryClient.getQueryData(queryKey)).toBeUndefined();
    expect(notifyA).not.toHaveBeenCalled();
    expect(notifyB).not.toHaveBeenCalled();
  });

  it("preserves legacy409 domain code and message for an unmigrated form", async () => {
    const duplicate = {
      code: "CATEGORY_ALREADY_EXISTS",
      message: "Категория с таким именем уже существует.",
      statusCode: 409,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () =>
        Response.json(duplicate, { status: 409 }),
      ),
    );
    await expect(
      fetcher("/api/v1/accounts/42/categories", {
        method: "POST",
        body: JSON.stringify({ name: "Продукты", type: "expense" }),
      }),
    ).rejects.toMatchObject(duplicate);
  });

  it.each(["HEAD", "OPTIONS"])(
    "preserves legacy %s on the wire",
    async (method) => {
      const fetchMock = vi.fn<typeof fetch>(
        async () => new Response(null, { status: 204 }),
      );
      vi.stubGlobal("fetch", fetchMock);
      await expect(
        fetcher("/api/v1/accounts/42/categories", { method }),
      ).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        "/api/v1/accounts/42/categories",
        expect.objectContaining({ method, credentials: "include" }),
      );
    },
  );

  it.each([200, 400])(
    "keeps a body-read AbortError as cancellation after HTTP%s headers",
    async (status) => {
      const reason = new DOMException("Pilot body cancelled", "AbortError");
      const response = Response.json(status === 200 ? categories : failure, {
        status,
      });
      vi.spyOn(response, "text").mockRejectedValue(reason);
      const events: unknown[] = [];
      const notifyError = vi.fn();
      const runtime = createApiRuntime({
        fetch: vi.fn<typeof fetch>(async () => response),
        observe: (event) => {
          events.push(event);
        },
        notifyError,
      });
      runtimes.push(runtime);
      const queryKey = ["body-cancelled", status];
      runtime.queryClient.setQueryData(queryKey, categories);
      await runtime.queryClient.invalidateQueries({
        queryKey,
        refetchType: "none",
      });
      const result = await runtime.queryClient
        .fetchQuery({
          queryKey,
          meta: { operation: "categoriesList" },
          queryFn: () =>
            runtime.transport.requestValidated(
              "/api/v1/accounts/42/categories",
              { method: "GET", operation: "categoriesList" },
              CategoriesListResponse,
            ),
        })
        .catch((error: unknown) => error);
      expect.soft(result).toBe(reason);
      expect.soft(result).not.toBeInstanceOf(ApiError);
      expect.soft(notifyError).not.toHaveBeenCalled();
      expect.soft(events).toEqual([
        expect.objectContaining({
          event: "http-completed",
          operation: "categoriesList",
          outcome: "cancelled",
        }),
        expect.objectContaining({
          event: "query-completed",
          operation: "categoriesList",
          result: "cancelled",
        }),
      ]);
      expect(runtime.queryClient.getQueryData(queryKey)).toEqual(categories);
    },
  );

  it("keeps an aborted shared-refresh waiter cancelled when refresh fails", async () => {
    const refresh = deferred<Response>();
    const fetchMock = vi.fn<typeof fetch>(async (url) =>
      String(url).endsWith("/auth/refresh")
        ? refresh.promise
        : Response.json({ statusCode: 401 }, { status: 401 }),
    );
    const runtime = createApiRuntime({
      fetch: fetchMock,
      notifyError: vi.fn(),
    });
    runtimes.push(runtime);
    const controller = new AbortController();
    const first = runtime.transport
      .requestValidated(
        "/api/v1/accounts/42/categories?waiter=first",
        {
          method: "GET",
          operation: "categoriesList",
          signal: controller.signal,
        },
        CategoriesListResponse,
      )
      .catch((error: unknown) => error);
    const second = runtime.transport
      .requestValidated(
        "/api/v1/accounts/42/categories?waiter=second",
        { method: "GET", operation: "categoriesList" },
        CategoriesListResponse,
      )
      .catch((error: unknown) => error);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const reason = new DOMException(
      "Pilot refresh waiter cancelled",
      "AbortError",
    );
    controller.abort(reason);
    refresh.resolve(
      Response.json(
        { code: "UNAVAILABLE", message: "Technical failure", statusCode: 500 },
        { status: 500 },
      ),
    );
    expect.soft(await first).toBe(reason);
    expect.soft(await second).toBeInstanceOf(ApiError);
    expect(await second).toMatchObject({ kind: API_ERROR_KIND.http, statusCode: 500 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/auth/refresh"),
      ),
    ).toHaveLength(1);
  });

  it("shares one validated refresh and never replays a cancelled waiter", async () => {
    const refresh = deferred<Response>();
    const requests = new Map<string, number>();
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url === "/api/v1/auth/refresh") return refresh.promise;
      const count = (requests.get(url) ?? 0) + 1;
      requests.set(url, count);
      return count === 1
        ? Response.json({ statusCode: 401 }, { status: 401 })
        : Response.json(categories);
    });
    const runtime = createApiRuntime({
      fetch: fetchMock,
      notifyError: vi.fn(),
    });
    runtimes.push(runtime);
    const first = new AbortController();
    const second = new AbortController();
    const firstUrl = "/api/v1/accounts/42/categories?type=expense&waiter=first";
    const secondUrl =
      "/api/v1/accounts/42/categories?type=expense&waiter=second";
    const cancelled = runtime.transport.requestValidated(
      firstUrl,
      { method: "GET", operation: "categoriesList", signal: first.signal },
      CategoriesListResponse,
    );
    const cancellation = cancelled.catch((error: unknown) => error);
    const surviving = runtime.transport.requestValidated(
      secondUrl,
      { method: "GET", operation: "categoriesList", signal: second.signal },
      CategoriesListResponse,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const reason = new DOMException("Pilot waiter stopped", "AbortError");
    first.abort(reason);
    refresh.resolve(Response.json({ success: true }));
    await expect(cancellation).resolves.toBe(reason);
    await expect(surviving).resolves.toEqual(categories);
    expect(requests.get(firstUrl)).toBe(1);
    expect(requests.get(secondUrl)).toBe(2);
    expect(
      fetchMock.mock.calls.filter(([url]) => url === "/api/v1/auth/refresh"),
    ).toHaveLength(1);
    const replay = fetchMock.mock.calls.at(-1);
    expect(replay?.[0]).toBe(secondUrl);
    expect(replay?.[1]?.signal).toBe(second.signal);
    expect(replay?.[1]?.credentials).toBe("include");
    expect(replay?.[1]).not.toHaveProperty("operation");
  });

  it("rejects an invalid successful refresh body without replay", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({ statusCode: 401 }, { status: 401 }),
      )
      .mockResolvedValueOnce(Response.json({ success: "invalid" }));
    const runtime = createApiRuntime({
      fetch: fetchMock,
      notifyError: vi.fn(),
    });
    runtimes.push(runtime);
    const request = runtime.transport.requestValidated(
      "/api/v1/accounts/42/categories?type=expense",
      { method: "GET", operation: "categoriesList" },
      CategoriesListResponse,
    );
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      kind: API_ERROR_KIND.invalidResponse,
      statusCode: 200,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/v1/auth/refresh");
  });

  it.each(["collector", "noop", "throw", "reject", "deferred"] as const)(
    "keeps ApiError, cached data and one prepared feedback with a %s observer",
    async (mode) => {
      const events: unknown[] = [];
      const pendingSink = deferred<void>();
      const observe = (event: unknown): void | Promise<void> => {
        events.push(event);
        if (mode === "throw") throw new Error("Pilot sink failure");
        if (mode === "reject")
          return Promise.reject(new Error("Pilot sink failure"));
        if (mode === "deferred") return pendingSink.promise;
        return undefined;
      };
      const notifyError = vi.fn();
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json(categories))
        .mockImplementation(async () =>
          Response.json(failure, { status: 400 }),
        );
      const runtime = createApiRuntime({
        fetch: fetchMock,
        notifyError,
        ...(mode !== "noop" && { observe }),
      });
      runtimes.push(runtime);
      const queryKey = ["pilot", "categories"];
      const queryFn = ({ signal }: { signal: AbortSignal }) =>
        runtime.transport.requestValidated(
          "/api/v1/accounts/42/categories?type=expense&probe=pilot-private-value",
          {
            method: "GET",
            operation: "categoriesList",
            signal,
            headers: { "x-pilot-secret": "pilot-private-header" },
          },
          CategoriesListResponse,
        );
      const options = {
        queryKey,
        queryFn,
        meta: { operation: "categoriesList" },
      } as const;
      await expect(runtime.queryClient.fetchQuery(options)).resolves.toEqual(
        categories,
      );
      expect(notifyError).not.toHaveBeenCalled();
      await runtime.queryClient.invalidateQueries({
        queryKey,
        refetchType: "none",
      });
      const rejected = runtime.queryClient.fetchQuery(options);
      await expect(rejected).rejects.toBeInstanceOf(ApiError);
      await expect(rejected).rejects.toMatchObject(failure);
      await Promise.resolve();
      expect(runtime.queryClient.getQueryData(queryKey)).toEqual(categories);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(notifyError).toHaveBeenCalledExactlyOnceWith({
        title: "Не удалось выполнить запрос",
        message: failure.message,
      });
      if (mode !== "noop") {
        expect(events).toHaveLength(4);
        expect(events).toEqual([
          expect.objectContaining({
            runtime: "frontend",
            event: "http-completed",
            operation: "categoriesList",
            method: "GET",
            outcome: "success",
            status: 200,
          }),
          expect.objectContaining({
            runtime: "frontend",
            event: "query-completed",
            operation: "categoriesList",
            result: "success",
          }),
          expect.objectContaining({
            runtime: "frontend",
            event: "http-completed",
            operation: "categoriesList",
            method: "GET",
            outcome: "http-error",
            status: 400,
          }),
          expect.objectContaining({
            runtime: "frontend",
            event: "query-completed",
            operation: "categoriesList",
            result: "error",
          }),
        ]);
        const serialized = JSON.stringify(events);
        for (const secret of [
          "pilot-private-value",
          "pilot-private-header",
          failure.message,
          "/api/v1/accounts/42/categories",
          "Продукты",
        ]) {
          expect(serialized).not.toContain(secret);
        }
      }
      if (mode === "deferred") {
        pendingSink.reject(new Error("Pilot delayed sink failure"));
        await Promise.resolve();
      }
    },
  );
});
