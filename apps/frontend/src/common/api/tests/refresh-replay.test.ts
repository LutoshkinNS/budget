import { afterEach, describe, expect, it, vi } from "vitest";

import { createApiRuntime } from "../api-runtime";
import { fetcher } from "../fetcher";
import { AuthRefreshResponse } from "../generate/authentication/authentication.zod.gen";
import { CategoriesListResponse } from "../generate/categories/categories.zod.gen";

import { deferred } from "./deferred";

const MODE = { legacy: "legacy", validated: "validated" } as const;
const PATH = {
  resource: "/api/v1/accounts/42/categories",
  refresh: "/api/v1/auth/refresh",
} as const;
const METHOD = { get: "GET", post: "POST" } as const;
const OPERATION = {
  resource: "categoriesList",
  refresh: "authRefresh",
} as const;
const FAILURE = {
  validation: {
    message: "Некорректные параметры запроса.",
    statusCode: 400,
  },
  unauthorized: {
    message: "Требуется действительная авторизация.",
    statusCode: 401,
  },
} as const;
const runtimes: ReturnType<typeof createApiRuntime>[] = [];

afterEach(() => {
  runtimes.splice(0).forEach((runtime) => runtime.dispose());
  vi.unstubAllGlobals();
});

function getPath(input: Parameters<typeof fetch>[0]) {
  return input instanceof Request ? input.url : input.toString();
}

function mount(
  mode: (typeof MODE)[keyof typeof MODE],
  fetchImpl: typeof fetch,
) {
  if (mode === MODE.legacy) {
    vi.stubGlobal("fetch", fetchImpl);
    return (path: string = PATH.resource, options?: RequestInit) =>
      fetcher(path, {
        ...options,
        method: path === PATH.refresh ? METHOD.post : METHOD.get,
      });
  }
  const runtime = createApiRuntime({ fetch: fetchImpl, notifyError: vi.fn() });
  runtimes.push(runtime);
  return (path: string = PATH.resource, options?: RequestInit) =>
    runtime.transport.requestValidated(
      path,
      {
        ...options,
        method: path === PATH.refresh ? METHOD.post : METHOD.get,
        operation:
          path === PATH.refresh ? OPERATION.refresh : OPERATION.resource,
      },
      path === PATH.refresh ? AuthRefreshResponse : CategoriesListResponse,
    );
}

function failure(status: 400 | 401) {
  return Response.json(
    status === 400 ? FAILURE.validation : FAILURE.unauthorized,
    { status },
  );
}

describe.each(Object.values(MODE))("%s transport refresh/replay", (mode) => {
  it("does not refresh or replay a malformed400 request", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => failure(400));
    const request = mount(mode, fetchMock);
    await expect(request()).rejects.toMatchObject(FAILURE.validation);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      PATH.resource,
      expect.objectContaining({ method: METHOD.get, credentials: "include" }),
    );
  });

  it("shares one pending refresh across overlapping401 requests and replays each once", async () => {
    const refreshEntered = deferred<void>();
    const refreshResponse = deferred<Response>();
    let resourceCalls = 0;
    let refreshCalls = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      if (getPath(input) === PATH.refresh) {
        refreshCalls += 1;
        refreshEntered.resolve();
        return refreshResponse.promise;
      }
      resourceCalls += 1;
      return resourceCalls <= 2 ? failure(401) : Response.json([]);
    });
    const request = mount(mode, fetchMock);
    const first = request();
    const second = request();
    const completed = Promise.all([first, second]);
    await refreshEntered.promise;
    expect(resourceCalls).toBe(2);
    expect(refreshCalls).toBe(1);
    refreshResponse.resolve(Response.json({ success: true }));
    await expect(completed).resolves.toEqual([[], []]);
    expect(resourceCalls).toBe(4);
    expect(refreshCalls).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(5);
    for (const [, options] of fetchMock.mock.calls)
      expect(options?.credentials).toBe("include");
  });

  it("does not start another refresh when the single replay is still401", async () => {
    const paths: string[] = [];
    const request = mount(
      mode,
      vi.fn<typeof fetch>(async (input) => {
        const path = getPath(input);
        paths.push(path);
        return path === PATH.refresh
          ? Response.json({ success: true })
          : failure(401);
      }),
    );
    await expect(request()).rejects.toMatchObject({ statusCode: 401 });
    expect(paths).toEqual([PATH.resource, PATH.refresh, PATH.resource]);
  });

  it.each([400, 401] as const)(
    "does not recurse or replay after refresh%s failure",
    async (status) => {
      const paths: string[] = [];
      const request = mount(
        mode,
        vi.fn<typeof fetch>(async (input) => {
          const path = getPath(input);
          paths.push(path);
          return failure(path === PATH.refresh ? status : 401);
        }),
      );
      await expect(request()).rejects.toMatchObject({ statusCode: status });
      expect(paths).toEqual([PATH.resource, PATH.refresh]);
    },
  );

  it.each([400, 401] as const)(
    "does not recursively refresh a direct refresh%s request",
    async (status) => {
      const fetchMock = vi.fn<typeof fetch>(async () => failure(status));
      const request = mount(mode, fetchMock);
      await expect(request(PATH.refresh)).rejects.toMatchObject({
        statusCode: status,
      });
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        PATH.refresh,
        expect.objectContaining({ method: METHOD.post }),
      );
    },
  );

  it("does not replay an aborted participant while the other request completes", async () => {
    const refreshEntered = deferred<void>();
    const refreshResponse = deferred<Response>();
    const controller = new AbortController();
    let resourceCalls = 0;
    const request = mount(
      mode,
      vi.fn<typeof fetch>(async (input) => {
        if (getPath(input) === PATH.refresh) {
          refreshEntered.resolve();
          return refreshResponse.promise;
        }
        resourceCalls += 1;
        return resourceCalls <= 2 ? failure(401) : Response.json([]);
      }),
    );
    const first = request(PATH.resource, { signal: controller.signal }).catch(
      (error: unknown) => error,
    );
    const second = request();
    await refreshEntered.promise;
    controller.abort();
    refreshResponse.resolve(Response.json({ success: true }));
    expect(await first).toBe(controller.signal.reason);
    await expect(second).resolves.toEqual([]);
    expect(resourceCalls).toBe(3);
  });
});
