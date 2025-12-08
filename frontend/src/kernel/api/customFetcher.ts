export const customFetcher = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw {
      code: res.status,
      message: res.statusText,
    };
  }

  if ([204, 205, 304].includes(res.status)) {
    return undefined as T;
  }

  return res.json();
};
