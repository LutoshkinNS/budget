let isRefreshing = false;

const BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : "";

export const fetcher = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  let res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw { code: "UNAUTHORIZED", message: "Failed to refresh token", statusCode: 401 };
      }

      res = await fetch(`${BASE_URL}${url}`, {
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
