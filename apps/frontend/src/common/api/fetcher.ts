import { createRefreshState, createRequestCore } from "./request-validated.ts";

type FetcherOptions = {
  refreshUnauthorized?: boolean;
};

const legacyRefreshState = createRefreshState();
const legacyRequestCore = createRequestCore({
  fetch: (input, init) => globalThis.fetch(input, init),
  refreshState: legacyRefreshState,
});

export function fetcher<T>(
  url: string,
  options?: RequestInit,
  fetcherOptions?: FetcherOptions,
): Promise<T>;
export async function fetcher(
  url: string,
  options?: RequestInit,
  fetcherOptions?: FetcherOptions,
): Promise<unknown> {
  return legacyRequestCore.requestLegacyData(url, options, fetcherOptions);
}
