import type { z } from "zod";

import { AuthRefreshResponse } from "./generate/authentication/authentication.zod.gen.ts";
import {
  API_ERROR_FEEDBACK,
  API_ERROR_KIND,
  ApiError,
  createApiHttpError,
  isCancellationError,
} from "./api-error.ts";
import type {
  ApiHttpMethod,
  ApiObserver,
  ApiOperation,
  ApiRequestMethod,
} from "./api-observation.ts";
import { safeObserve } from "./api-observation.ts";

declare const __API_BASE_URL__: string;

const BASE_URL = __API_BASE_URL__;

type RefreshState = { promise: Promise<void> | null };
type RequestAttempt = {
  response: Response;
  operation: ApiOperation;
  method: ApiHttpMethod;
  startedAt: number;
};

export type ApiRequestOptions = Omit<RequestInit, "method"> & {
  method: ApiRequestMethod;
  operation: ApiOperation;
};

type RequestCoreOptions = {
  fetch: typeof globalThis.fetch;
  observe?: ApiObserver;
  refreshState: RefreshState;
};

type LegacyRequestOptions = {
  refreshUnauthorized?: boolean;
};

export function createRefreshState(): RefreshState {
  return { promise: null };
}

export function createRequestCore({
  fetch: fetchImpl,
  observe,
  refreshState,
}: RequestCoreOptions) {
  async function fetchResponse(
    url: string,
    wireMethod: string,
    operation: ApiOperation,
    options: RequestInit,
  ): Promise<RequestAttempt> {
    const startedAt = performance.now();
    const method = getObservationMethod(wireMethod);

    try {
      const response = await fetchImpl(`${BASE_URL}${url}`, {
        ...options,
        method: wireMethod,
        credentials: "include",
      });
      return { response, operation, method, startedAt };
    } catch (error) {
      if (isCancellationError(error)) {
        emitHttpEvent(operation, method, "cancelled", undefined, startedAt);
        throw error;
      }

      emitHttpEvent(operation, method, "network-error", undefined, startedAt);
      throw new ApiError({
        kind: API_ERROR_KIND.network,
        message: API_ERROR_FEEDBACK.request.message,
        statusCode: 0,
      });
    }
  }

  function emitHttpEvent(
    operation: ApiOperation,
    method: ApiHttpMethod,
    outcome:
      | "success"
      | "http-error"
      | "network-error"
      | "cancelled"
      | "body-error",
    status: number | undefined,
    startedAt: number,
  ) {
    const durationMs = Math.max(0, performance.now() - startedAt);
    safeObserve(observe, {
      runtime: "frontend",
      event: "http-completed",
      operation,
      method,
      outcome,
      ...(status !== undefined && { status }),
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
    });
  }

  function completeAttempt(
    attempt: RequestAttempt,
    outcome: "success" | "http-error" | "body-error" | "cancelled",
  ) {
    emitHttpEvent(
      attempt.operation,
      attempt.method,
      outcome,
      attempt.response.status,
      attempt.startedAt,
    );
  }

  async function refreshAccessToken(): Promise<void> {
    const attempt = await fetchResponse(
      "/api/v1/auth/refresh",
      "POST",
      "authRefresh",
      {},
    );

    if (!attempt.response.ok) {
      throw await createHttpError(attempt);
    }

    const body = await parseSuccessJson(attempt);
    const validation = AuthRefreshResponse.safeParse(body);
    if (!validation.success || !validation.data.success) {
      emitInvalidResponse(
        "authRefresh",
        "schema-mismatch",
        attempt.response.status,
      );
      throw invalidResponseError(attempt.response.status);
    }
  }

  async function ensureRefresh(): Promise<void> {
    refreshState.promise ??= refreshAccessToken().finally(() => {
      refreshState.promise = null;
    });
    await refreshState.promise;
  }

  async function fetchWithRefresh(
    url: string,
    options: ApiRequestOptions,
  ): Promise<RequestAttempt> {
    const { method, operation, ...requestOptions } = options;
    let attempt = await fetchResponse(url, method, operation, requestOptions);

    if (attempt.response.status !== 401 || operation === "authRefresh") {
      return attempt;
    }

    completeAttempt(attempt, "http-error");
    try {
      await ensureRefresh();
    } catch (error) {
      if (requestOptions.signal?.aborted) {
        throw getAbortReason(requestOptions.signal);
      }
      throw error;
    }
    if (requestOptions.signal?.aborted) {
      throw getAbortReason(requestOptions.signal);
    }

    attempt = await fetchResponse(url, method, operation, requestOptions);
    return attempt;
  }

  async function requestValidated<S extends z.ZodType>(
    url: string,
    options: ApiRequestOptions,
    schema: S,
  ): Promise<z.output<S>> {
    const attempt = await fetchWithRefresh(url, options);
    if (!attempt.response.ok) throw await createHttpError(attempt);
    if ([204, 205, 304].includes(attempt.response.status)) {
      completeAttempt(attempt, "success");
      emitInvalidResponse(
        options.operation,
        "schema-mismatch",
        attempt.response.status,
      );
      throw invalidResponseError(attempt.response.status);
    }

    const body = await parseSuccessJson(attempt);
    const validation = schema.safeParse(body);
    if (!validation.success) {
      emitInvalidResponse(
        options.operation,
        "schema-mismatch",
        attempt.response.status,
      );
      throw invalidResponseError(attempt.response.status);
    }
    return validation.data;
  }

  async function parseSuccessJson(attempt: RequestAttempt) {
    let text: string;
    try {
      text = await attempt.response.text();
    } catch (error) {
      if (isCancellationError(error)) {
        completeAttempt(attempt, "cancelled");
        throw error;
      }
      completeAttempt(attempt, "body-error");
      throw invalidResponseError(attempt.response.status);
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      completeAttempt(attempt, "success");
      emitInvalidResponse(
        attempt.operation,
        "invalid-json",
        attempt.response.status,
      );
      throw invalidResponseError(attempt.response.status);
    }

    completeAttempt(attempt, "success");
    return body;
  }

  async function createHttpError(attempt: RequestAttempt): Promise<ApiError> {
    let text: string;
    try {
      text = await attempt.response.text();
    } catch (error) {
      if (isCancellationError(error)) {
        completeAttempt(attempt, "cancelled");
        throw error;
      }
      completeAttempt(attempt, "body-error");
      return createApiHttpError(undefined, attempt.response.status);
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      completeAttempt(attempt, "http-error");
      return createApiHttpError(undefined, attempt.response.status);
    }

    completeAttempt(attempt, "http-error");
    return createApiHttpError(body, attempt.response.status);
  }

  function emitInvalidResponse(
    operation: ApiOperation,
    reason: "invalid-json" | "schema-mismatch",
    status: number,
  ) {
    safeObserve(observe, {
      runtime: "frontend",
      event: "response-invalid",
      operation,
      reason,
      status,
    });
  }

  function invalidResponseError(statusCode: number): ApiError {
    return new ApiError({
      kind: API_ERROR_KIND.invalidResponse,
      message: API_ERROR_FEEDBACK.invalidResponse.message,
      statusCode,
    });
  }

  async function requestLegacyAttempt(
    url: string,
    options?: RequestInit,
    { refreshUnauthorized = true }: LegacyRequestOptions = {},
  ): Promise<RequestAttempt> {
    const wireMethod = options?.method ?? "GET";
    const attempt = await fetchResponse(
      url,
      wireMethod,
      "unknown-operation",
      options ?? {},
    );

    if (
      !refreshUnauthorized ||
      attempt.response.status !== 401 ||
      url === "/api/v1/auth/refresh"
    ) {
      return attempt;
    }

    try {
      await ensureRefresh();
    } catch (error) {
      const signal = options?.signal;
      if (signal?.aborted) throw getAbortReason(signal);
      throw error;
    }

    const signal = options?.signal;
    if (signal?.aborted) throw getAbortReason(signal);

    const retry = await fetchResponse(
      url,
      wireMethod,
      "unknown-operation",
      options ?? {},
    );
    return retry;
  }

  async function requestLegacyResponse(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    return (await requestLegacyAttempt(url, options)).response;
  }

  async function requestLegacyData(
    url: string,
    options?: RequestInit,
    requestOptions?: LegacyRequestOptions,
  ): Promise<unknown> {
    const attempt = await requestLegacyAttempt(url, options, requestOptions);
    if (!attempt.response.ok) throw await createHttpError(attempt);
    if ([204, 205, 304].includes(attempt.response.status)) {
      completeAttempt(attempt, "success");
      return undefined;
    }
    return parseSuccessJson(attempt);
  }

  return { requestLegacyData, requestLegacyResponse, requestValidated };
}

function getAbortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException("Aborted", "AbortError");
}

function getObservationMethod(method: string): ApiHttpMethod {
  const normalized = method.toUpperCase();
  return isApiHttpMethod(normalized) ? normalized : "unknown-method";
}

function isApiHttpMethod(
  method: string,
): method is Exclude<ApiHttpMethod, "unknown-method"> {
  return ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(
    method,
  );
}
