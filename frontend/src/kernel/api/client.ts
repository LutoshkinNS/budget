type CustomFetchResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<CustomFetchResponse<T>> => {
  const response = await fetch(url, options);

  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  const data: T = body ? JSON.parse(body) : ({} as T);

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as CustomFetchResponse<T>;
};