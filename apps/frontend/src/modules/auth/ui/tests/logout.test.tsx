import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { deferred } from "@/common/api/tests/deferred";

import { Logout } from "../logout";

const navigate = vi.hoisted(() => vi.fn());
vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));

const key = getAuthMeQueryKey();
const me = { userId: 1, accounts: [] };
const fetchMock = vi.fn<typeof fetch>();
const success = () => Response.json({ success: true });
let client: QueryClient;

function renderLogout(visible = true) {
  return (
    <QueryClientProvider client={client}>
      {visible && <Logout />}
    </QueryClientProvider>
  );
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(key, me);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

describe("Logout", () => {
  it("disables duplicate logout, keeps the session while pending and clears it after success", async () => {
    const request = deferred<Response>();
    fetchMock.mockReturnValueOnce(request.promise);
    render(renderLogout());

    try {
      const button = screen.getByRole("button", { name: "Выйти" });
      act(() => {
        fireEvent.click(button);
        fireEvent.click(button);
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(button).toHaveProperty("disabled", true);
      expect(screen.getByRole("status")).not.toBeNull();
      expect(client.getQueryData(key)).toEqual(me);

      request.resolve(success());

      await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: "/login" }),
      );
      expect(client.getQueryData(key)).toBeUndefined();
    } finally {
      request.resolve(success());
    }
  });

  it("keeps the session and draft data, shows a local error and allows retry after failed logout", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Disconnected"));
    client.setQueryData(["private-draft"], "Сохранить");
    render(renderLogout());

    fireEvent.click(screen.getByRole("button", { name: "Выйти" }));

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Выйти" })).toHaveProperty(
      "disabled",
      false,
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(client.getQueryData(key)).toEqual(me);
    expect(client.getQueryData(["private-draft"])).toBe("Сохранить");
  });

  it("clears the session on an accepted logout after leaving the Settings screen", async () => {
    const request = deferred<Response>();
    fetchMock.mockReturnValueOnce(request.promise);
    const { rerender } = render(renderLogout());

    try {
      fireEvent.click(screen.getByRole("button", { name: "Выйти" }));
      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      rerender(renderLogout(false));
      request.resolve(success());

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith(
          expect.objectContaining({ to: "/login" }),
        ),
      );
      expect(client.getQueryData(key)).toBeUndefined();
    } finally {
      request.resolve(success());
    }
  });
});
