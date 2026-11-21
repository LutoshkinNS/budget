import { StrictMode } from "react";
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

import { deferred } from "@/common/api/tests/deferred";

import { INVITE_CODE_KEY } from "../../model/constants";
import { ByTelegram } from "../by-telegram";

const { navigate, reportAuthEvent } = vi.hoisted(() => ({
  navigate: vi.fn(),
  reportAuthEvent: vi.fn(),
}));

vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));

vi.mock(import("../../model/report-auth-event"), () => ({ reportAuthEvent }));

vi.mock(import("@/common/lib/notifications"), async (importOriginal) => ({
  ...(await importOriginal()),
  useNotifications: () => ({
    notifications: [],
    addNotification: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

const telegramUser = {
  id: 1,
  first_name: "Playwright",
  auth_date: 1_782_844_000,
  hash: "a".repeat(64),
};
const fetchMock = vi.fn<typeof fetch>();
const success = () => Response.json({ success: true });
let client: QueryClient;

function getWidgetScript() {
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="telegram-widget"]',
  );
  if (!script) throw new Error("Telegram widget script is missing");
  return script;
}

function loginScreen(visible = true) {
  return (
    <StrictMode>
      <QueryClientProvider client={client}>
        {visible && <ByTelegram />}
      </QueryClientProvider>
    </StrictMode>
  );
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  client.clear();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  delete window.onTelegramAuth;
});

describe("ByTelegram", () => {
  it("keeps one Telegram script across rerenders", () => {
    const { rerender } = render(loginScreen());
    const initialScript = getWidgetScript();

    rerender(loginScreen());

    expect(getWidgetScript()).toBe(initialScript);
    expect(
      document.querySelectorAll('script[src*="telegram-widget"]'),
    ).toHaveLength(1);
  });

  it("submits once on duplicate Telegram callbacks and overlapping Dev login", async () => {
    const request = deferred<Response>();
    fetchMock.mockReturnValueOnce(request.promise);
    const { rerender } = render(loginScreen());
    const initialScript = getWidgetScript();
    window.sessionStorage.setItem(INVITE_CODE_KEY, "accepted-invite");
    try {
      act(() => {
        window.onTelegramAuth?.(telegramUser);
        window.onTelegramAuth?.(telegramUser);
        fireEvent.click(screen.getByRole("button", { name: "Dev login" }));
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        expect.objectContaining({ method: "POST" }),
      );
      expect(screen.getByText("Выполняется вход…")).not.toBeNull();

      rerender(loginScreen());
      expect(getWidgetScript()).toBe(initialScript);
      request.resolve(success());

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledExactlyOnceWith({
          to: "/invite/$code",
          params: { code: "accepted-invite" },
        }),
      );
      expect(window.sessionStorage.getItem(INVITE_CODE_KEY)).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(reportAuthEvent).toHaveBeenCalledWith(
        "login_succeeded",
        expect.objectContaining({ attemptId: expect.any(String) }),
      );
    } finally {
      request.resolve(success());
    }
  });

  it("does not show fallback after the widget script loads", () => {
    vi.useFakeTimers();
    render(loginScreen());
    act(() => {
      getWidgetScript().dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(20_000);
    });
    expect(
      screen.queryByText("Не получается войти через Telegram?"),
    ).toBeNull();
  });

  it("shows fallback on widget timeout and recovers after load", () => {
    vi.useFakeTimers();
    render(loginScreen());
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(
      screen.getByText("Не получается войти через Telegram?"),
    ).not.toBeNull();
    act(() => {
      getWidgetScript().dispatchEvent(new Event("load"));
    });
    expect(
      screen.queryByText("Не получается войти через Telegram?"),
    ).toBeNull();
  });

  it.each([
    ["HTTP error", () => Response.json({ success: true }, { status: 500 })],
    ["invalid body", () => Response.json({ success: "true" })],
    ["denied body", () => Response.json({ success: false })],
  ] as const)(
    "keeps Dev login local when it receives %s",
    async (_label, response) => {
      fetchMock
        .mockResolvedValueOnce(response())
        .mockResolvedValueOnce(success());
      window.sessionStorage.setItem(INVITE_CODE_KEY, "pending");
      render(loginScreen());

      fireEvent.click(screen.getByRole("button", { name: "Dev login" }));

      expect(await screen.findByRole("alert")).not.toBeNull();
      expect(navigate).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem(INVITE_CODE_KEY)).toBe("pending");
      expect(getWidgetScript().isConnected).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Dev login" }));
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledExactlyOnceWith({ to: "/" }),
      );
    },
  );

  it("ignores old Telegram success after a real unmount and StrictMode remount", async () => {
    const request = deferred<Response>();
    fetchMock.mockReturnValueOnce(request.promise);
    const { rerender } = render(loginScreen());
    window.sessionStorage.setItem(INVITE_CODE_KEY, "old-invite");
    try {
      act(() => {
        window.onTelegramAuth?.(telegramUser);
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      rerender(loginScreen(false));
      rerender(loginScreen());
      window.sessionStorage.setItem(INVITE_CODE_KEY, "new-invite");
      client.setQueryData(["new-route"], "keep");

      await act(async () => {
        request.resolve(success());
      });

      expect(navigate).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem(INVITE_CODE_KEY)).toBe("new-invite");
      expect(client.getQueryData(["new-route"])).toBe("keep");
      expect(reportAuthEvent).not.toHaveBeenCalledWith(
        "login_succeeded",
        expect.anything(),
      );
    } finally {
      request.resolve(success());
    }
  });
});
