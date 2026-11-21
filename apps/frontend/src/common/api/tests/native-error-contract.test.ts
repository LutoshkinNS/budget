import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ERROR_KIND, ApiError } from "../api-error";
import { createApiRuntime } from "../api-runtime";
import { fetcher } from "../fetcher";
import { CategoriesListResponse } from "../generate/categories/categories.zod.gen";

const MODE = { legacy: "legacy", validated: "validated" } as const;
const PATH = "/api/v1/accounts/42/categories";
const METHOD = "GET";
const OPERATION = "categoriesList";
const SAFE_MESSAGE = "Не удалось выполнить запрос. Повторите попытку.";
const BUSINESS = {
  conflict: "CATEGORY_ALREADY_EXISTS",
  invitation: "INVITATION_NOT_FOUND",
} as const;
const SECRET = "private-proxy-response-secret";
const VALID_CASES = [
  { status: 400, message: "Некорректные параметры запроса." },
  { status: 403, message: "Нет доступа к счёту." },
  {
    status: 404,
    message: "Приглашение не найдено.",
    code: BUSINESS.invitation,
  },
  {
    status: 409,
    message: "Категория уже существует.",
    code: BUSINESS.conflict,
  },
  { status: 429, message: "Повторите запрос позже." },
] as const;
const INVALID_CASES = [
  { name: "missing status", body: { message: SECRET } },
  { name: "mismatched status", body: { statusCode: 403, message: SECRET } },
  { name: "string status", body: { statusCode: "400", message: SECRET } },
  { name: "fractional status", body: { statusCode: 400.5, message: SECRET } },
  { name: "missing message", body: { statusCode: 400 } },
  { name: "empty message", body: { statusCode: 400, message: "  " } },
  { name: "wrong message type", body: { statusCode: 400, message: 17 } },
  {
    name: "unknown code",
    body: { statusCode: 400, message: SECRET, code: "PRIVATE_FRAMEWORK_CODE" },
  },
  { name: "null code", body: { statusCode: 400, message: SECRET, code: null } },
  {
    name: "wrong code type",
    body: { statusCode: 400, message: SECRET, code: 17 },
  },
  { name: "null body", body: null },
  { name: "array body", body: [] },
  { name: "string body", body: SECRET },
] as const;
const runtimes: ReturnType<typeof createApiRuntime>[] = [];

afterEach(() => {
  runtimes.splice(0).forEach((runtime) => runtime.dispose());
  vi.unstubAllGlobals();
});

function mount(
  mode: (typeof MODE)[keyof typeof MODE],
  fetchImpl: typeof fetch,
) {
  if (mode === MODE.legacy) {
    vi.stubGlobal("fetch", fetchImpl);
    return () => fetcher(PATH, { method: METHOD });
  }
  const runtime = createApiRuntime({ fetch: fetchImpl, notifyError: vi.fn() });
  runtimes.push(runtime);
  return () =>
    runtime.transport.requestValidated(
      PATH,
      { method: METHOD, operation: OPERATION },
      CategoriesListResponse,
    );
}

async function capture(request: () => Promise<unknown>): Promise<ApiError> {
  const error: unknown = await request().catch((failure: unknown) => failure);
  expect(error).toBeInstanceOf(ApiError);
  if (!(error instanceof ApiError)) throw new Error("Expected ApiError");
  return error;
}

describe.each(Object.values(MODE))("%s native error contract", (mode) => {
  it.each(VALID_CASES)(
    "accepts valid HTTP$status safe text with optional business code",
    async (body) => {
      const fetchMock = vi.fn<typeof fetch>(async () =>
        Response.json(body, { status: body.status }),
      );
      const wireBody = {
        statusCode: body.status,
        message: body.message,
        ...("code" in body ? { code: body.code } : {}),
      };
      fetchMock.mockImplementation(async () =>
        Response.json(wireBody, { status: body.status }),
      );
      const error = await capture(mount(mode, fetchMock));
      expect(error).toMatchObject({
        kind: API_ERROR_KIND.http,
        statusCode: body.status,
        message: body.message,
      });
      expect(error.code).toBe("code" in body ? body.code : undefined);
      expect(error.getTextError()).toBe(body.message);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(INVALID_CASES)("uses a safe fallback for $name", async ({ body }) => {
    const error = await capture(
      mount(
        mode,
        vi.fn<typeof fetch>(async () => Response.json(body, { status: 400 })),
      ),
    );
    expect(error).toMatchObject({
      kind: API_ERROR_KIND.http,
      statusCode: 400,
      message: SAFE_MESSAGE,
    });
    expect(error.code).toBeUndefined();
    expect(error.message).not.toContain(SECRET);
  });

  it.each([500, 502, 503, 599])(
    "hides even structurally valid HTTP%s server text",
    async (status) => {
      const error = await capture(
        mount(
          mode,
          vi.fn<typeof fetch>(async () =>
            Response.json({ statusCode: status, message: SECRET }, { status }),
          ),
        ),
      );
      expect(error).toMatchObject({
        kind: API_ERROR_KIND.http,
        statusCode: status,
        message: SAFE_MESSAGE,
      });
      expect(error.code).toBeUndefined();
    },
  );

  it.each(["<html>private-proxy-response-secret</html>", "{", ""])(
    "uses actual HTTP status for a non-JSON body %j",
    async (body) => {
      const error = await capture(
        mount(
          mode,
          vi.fn<typeof fetch>(async () => new Response(body, { status: 403 })),
        ),
      );
      expect(error).toMatchObject({
        kind: API_ERROR_KIND.http,
        statusCode: 403,
        message: SAFE_MESSAGE,
      });
      expect(error.code).toBeUndefined();
    },
  );

  it("keeps network failures distinct from HTTP failures", async () => {
    const error = await capture(
      mount(
        mode,
        vi.fn<typeof fetch>(async () => {
          throw new TypeError(SECRET);
        }),
      ),
    );
    expect(error).toMatchObject({ kind: API_ERROR_KIND.network, statusCode: 0 });
    expect(error.code).toBeUndefined();
    expect(error.message).not.toContain(SECRET);
  });

  it("does not wrap cancellation", async () => {
    const reason = new DOMException("Native request cancelled", "AbortError");
    const request = mount(
      mode,
      vi.fn<typeof fetch>(async () => {
        throw reason;
      }),
    );
    await expect(request()).rejects.toBe(reason);
  });
});
