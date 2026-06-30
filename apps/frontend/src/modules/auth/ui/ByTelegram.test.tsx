import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ByTelegram } from "./ByTelegram.tsx";

const mocks = vi.hoisted(() => {
  const addNotification = vi.fn();
  const login = vi.fn();
  const removeQueries = vi.fn();

  return {
    addNotification,
    login,
    navigate: vi.fn(),
    notificationContext: { addNotification },
    queryClient: { removeQueries },
    removeQueries,
    reportAuthEvent: vi.fn(),
    unstableHookReferences: true,
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () =>
    mocks.unstableHookReferences
      ? { removeQueries: mocks.removeQueries }
      : mocks.queryClient,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () =>
    mocks.unstableHookReferences
      ? {
          addNotification: (notification: unknown) =>
            mocks.addNotification(notification),
        }
      : mocks.notificationContext,
}));

vi.mock("../model/reportAuthEvent.ts", () => ({
  reportAuthEvent: (...args: unknown[]) => mocks.reportAuthEvent(...args),
}));

vi.mock("../model/useLogin.ts", () => ({
  useLogin: () =>
    mocks.unstableHookReferences
      ? {
          login: (data: unknown) => mocks.login(data),
        }
      : { login: mocks.login },
}));

const telegramUser = {
  id: 1,
  first_name: "Playwright",
  auth_date: 1_782_844_000,
  hash: "a".repeat(64),
};

function getWidgetScript() {
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="telegram-widget"]',
  );

  expect(script).not.toBeNull();
  return script as HTMLScriptElement;
}

describe("ByTelegram", () => {
  beforeEach(() => {
    mocks.addNotification.mockReset();
    mocks.login.mockReset();
    mocks.login.mockResolvedValue(undefined);
    mocks.navigate.mockReset();
    mocks.navigate.mockResolvedValue(undefined);
    mocks.removeQueries.mockReset();
    mocks.reportAuthEvent.mockReset();
    mocks.reportAuthEvent.mockResolvedValue(undefined);
    mocks.unstableHookReferences = true;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    delete window.onTelegramAuth;
  });

  it("keeps one Telegram script across rerenders", () => {
    const { rerender } = render(<ByTelegram />);
    const initialScript = getWidgetScript();

    rerender(<ByTelegram />);

    expect(getWidgetScript()).toBe(initialScript);
    expect(
      document.querySelectorAll('script[src*="telegram-widget"]'),
    ).toHaveLength(1);
  });

  it("submits only once when Telegram calls the callback twice", async () => {
    let resolveLogin: (() => void) | undefined;
    mocks.login.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    render(<ByTelegram />);

    act(() => {
      void window.onTelegramAuth?.(telegramUser);
      void window.onTelegramAuth?.(telegramUser);
    });

    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));

    await act(async () => resolveLogin?.());
  });

  it("keeps the widget mounted while the login promise is pending", async () => {
    let resolveLogin: (() => void) | undefined;
    mocks.login.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const { rerender } = render(<ByTelegram />);
    const initialScript = getWidgetScript();

    act(() => {
      void window.onTelegramAuth?.(telegramUser);
    });
    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Выполняется вход…")).not.toBeNull();

    rerender(<ByTelegram />);

    expect(getWidgetScript()).toBe(initialScript);

    await act(async () => resolveLogin?.());
  });

  it("does not show fallback after the widget script loads", () => {
    vi.useFakeTimers();
    mocks.unstableHookReferences = false;
    render(<ByTelegram />);

    act(() => {
      getWidgetScript().dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(20_000);
    });

    expect(
      screen.queryByText("Не получается войти через Telegram?"),
    ).toBeNull();
  });
});
