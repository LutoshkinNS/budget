let refreshPromise: Promise<void> | null = null;

declare const __API_BASE_URL__: string;

const BASE_URL = __API_BASE_URL__;

const NETWORK_ERROR = {
  code: "Ошибка сети",
  message:
    "Не удалось связаться с сервером. Проверьте интернет-соединение или попробуйте обновить страницу.",
  statusCode: 0,
} as const;

async function request(url: string, options?: RequestInit) {
  try {
    return await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: "include",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw NETWORK_ERROR;
  }
}

async function refreshAccessToken() {
  const refreshRes = await request("/api/v1/auth/refresh", {
    method: "POST",
  });

  if (!refreshRes.ok) {
    throw await refreshRes.json();
  }
}

export const fetcher = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  let res = await request(url, {
    ...options,
  });

  if (res.status === 401 && url !== "/api/v1/auth/refresh") {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    await refreshPromise;

    res = await request(url, {
      ...options,
    });
  }

  if (!res.ok) {
    console.error("error response", res);
    throw await res.json();
  }

  return res.json();
};
