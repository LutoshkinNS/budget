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
      const refreshRes = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new Error("Failed to refresh token");
      }

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
