import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Logout } from "./Logout.tsx";

type LogoutMutationOptions = {
  onSuccess?: () => unknown;
  onError?: (error: { code?: string; message?: string }) => unknown;
};

const mocks = vi.hoisted(() => ({
  addNotification: vi.fn(),
  clear: vi.fn(),
  isPending: false,
  mutate: vi.fn(),
  mutationOptions: undefined as LogoutMutationOptions | undefined,
  navigate: vi.fn(),
}));

vi.mock("@/common/api/generate/authentication/authentication.gen.ts", () => ({
  useAuthLogout: (options: { mutation?: LogoutMutationOptions }) => {
    mocks.mutationOptions = options.mutation;

    return {
      isPending: mocks.isPending,
      mutate: mocks.mutate,
    };
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ clear: mocks.clear }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/common/lib/notifications", () => ({
  useNotifications: () => ({ addNotification: mocks.addNotification }),
}));

describe("Logout", () => {
  beforeEach(() => {
    mocks.addNotification.mockReset();
    mocks.clear.mockReset();
    mocks.isPending = false;
    mocks.mutate.mockReset();
    mocks.mutationOptions = undefined;
    mocks.navigate.mockReset();
    mocks.navigate.mockResolvedValue(undefined);
    mocks.mutate.mockImplementation(() => {
      void mocks.mutationOptions?.onSuccess?.();
    });
  });

  afterEach(cleanup);

  it("clears user data and navigates to login after logout", async () => {
    render(<Logout />);

    fireEvent.click(screen.getByRole("button", { name: "Выйти" }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mocks.clear).toHaveBeenCalledTimes(1));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/login" });
  });

  it("keeps the session UI and shows an error when logout fails", () => {
    mocks.mutate.mockImplementation(() => {
      mocks.mutationOptions?.onError?.({
        code: "Ошибка сети",
        message: "Не удалось связаться с сервером",
      });
    });
    render(<Logout />);

    fireEvent.click(screen.getByRole("button", { name: "Выйти" }));

    expect(mocks.addNotification).toHaveBeenCalledWith({
      id: "useLogoutError",
      title: "Ошибка сети",
      message: "Не удалось связаться с сервером",
    });
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("disables logout while the request is pending", () => {
    mocks.isPending = true;
    render(<Logout />);

    const button = screen.getByRole("button", { name: "Выйти" });

    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
