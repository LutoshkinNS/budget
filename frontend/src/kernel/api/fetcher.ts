import { authRefresh } from "../api/generate/authentication/authentication.gen.ts";

let isRefreshing = false;

export const fetcher = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      await authRefresh();

      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } catch (refreshError) {
      isRefreshing = false;
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    console.error("error response", res);
    throw await res.json();
  }

  return res.json();
};
