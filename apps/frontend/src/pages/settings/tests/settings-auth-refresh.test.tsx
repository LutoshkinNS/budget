import { QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppQueryClient } from "@/common/api/app-query";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { deferred } from "@/common/api/tests/deferred";
import { NotificationsTestRoot as Notifications } from "@/common/lib/notifications/tests/notifications-test-root";
import { useMe } from "@/modules/user";

import { Settings } from "..";

let queryClient: ReturnType<typeof createAppQueryClient>;

vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}));

const key = getAuthMeQueryKey();
const profile = {
  userId: 1,
  accounts: [
    { id: 1, name: "Основной счёт", initialBalance: 0, isOwner: true },
  ],
};
const fetchMock = vi.fn<typeof fetch>();

function AuthenticatedSettings() {
  const me = useMe();
  return (
    <>
      {me.isError && <p>Обновление профиля завершилось ошибкой</p>}
      {me.hasValidData && <Settings />}
    </>
  );
}

beforeEach(() => {
  queryClient = createAppQueryClient(() => {});
  queryClient.setDefaultOptions({
    queries: { retry: false, staleTime: 60_000 },
  });
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("auth refresh on Settings", () => {
  it("keeps the mounted rename draft through invalid and failed profile refreshes", async () => {
    const invalid = deferred<Response>();
    const offline = deferred<Response>();
    fetchMock
      .mockResolvedValueOnce(Response.json(profile))
      .mockReturnValueOnce(invalid.promise)
      .mockReturnValueOnce(offline.promise);
    render(
      <QueryClientProvider client={queryClient}>
        <Notifications>
          <AuthenticatedSettings />
        </Notifications>
      </QueryClientProvider>,
    );
    try {
      await screen.findByRole("button", { name: "Изменить" });
      const settings = within(
        screen.getByRole("group", { name: "Настройки выбранного аккаунта" }),
      );
      fireEvent.click(settings.getByRole("button", { name: "Изменить" }));
      const draft = settings.getByRole("textbox", {
        name: "Название аккаунта",
      });
      fireEvent.change(draft, { target: { value: "Мой черновик" } });
      expect(queryClient.getQueryData(key)).toEqual(profile);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      act(() => {
        void queryClient.invalidateQueries({ queryKey: key });
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      expect(draft).toHaveProperty("value", "Мой черновик");
      invalid.resolve(Response.json({ userId: 1, accounts: false }));
      await screen.findByText("Обновление профиля завершилось ошибкой");
      expect(queryClient.getQueryData(key)).toEqual(profile);
      expect(settings.getByRole("textbox", { name: "Название аккаунта" })).toBe(
        draft,
      );

      act(() => {
        void queryClient.invalidateQueries({ queryKey: key });
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
      offline.reject(new TypeError("Disconnected"));
      await waitFor(() =>
        expect(queryClient.getQueryState(key)?.fetchStatus).toBe("idle"),
      );
      expect(queryClient.getQueryData(key)).toEqual(profile);
      expect(settings.getByRole("textbox", { name: "Название аккаунта" })).toBe(
        draft,
      );
      expect(draft).toHaveProperty("value", "Мой черновик");
      expect(screen.queryByRole("status")).toBeNull();
    } finally {
      invalid.resolve(Response.json(profile));
      offline.resolve(Response.json(profile));
    }
  });
});
