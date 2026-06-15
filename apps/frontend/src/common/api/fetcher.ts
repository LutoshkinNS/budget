let refreshPromise: Promise<void> | null = null;

const BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : "";

async function refreshAccessToken() {
  const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!refreshRes.ok) {
    throw {
      code: "UNAUTHORIZED",
      message: "Failed to refresh token",
      statusCode: 401,
    };
  }
}

export const fetcher = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  let res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401 && url !== "/api/v1/auth/refresh") {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    await refreshPromise;

    res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: "include",
    });
  }

  if (!res.ok) {
    console.error("error response", res);
    throw await res.json();
  }

  return res.json();
};
