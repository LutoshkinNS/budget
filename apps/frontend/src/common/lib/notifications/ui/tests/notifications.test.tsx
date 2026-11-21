import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NotificationsProvider, useNotifications } from "../..";
import { NotificationTestView } from "../../tests/notifications-test-root";
import { Notifications } from "../notifications";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("notifications presentation", () => {
  it("renders independent string and numeric ids and closes the selected id", () => {
    const onClose = vi.fn();
    render(
      <Notifications
        notifications={[
          { id: "1", title: "Ошибка", message: "Равный текст" },
          { id: 1, title: "Ошибка", message: "Равный текст", type: "success" },
        ]}
        onClose={onClose}
      />,
    );
    expect(screen.getAllByText("Равный текст")).toHaveLength(2);
    const buttons = screen.getAllByRole("button", { name: "×" });
    const numeric = buttons[1];
    if (!numeric) throw new Error("Missing second notification close");
    fireEvent.click(numeric);
    expect(onClose).toHaveBeenCalledWith(1);
  });

  it("retains model state and the original deadline while its view is hidden", () => {
    vi.useFakeTimers();
    let add: ReturnType<typeof useNotifications>["addNotification"] | undefined;
    function Actions() {
      const model = useNotifications();
      add = model.addNotification;
      return null;
    }
    const tree = (visible: boolean) => (
      <NotificationsProvider>
        <Actions />
        {visible && <NotificationTestView />}
      </NotificationsProvider>
    );
    const view = render(tree(true));
    const addNotification = add;
    if (!addNotification) throw new Error("Missing notification model");
    act(() => addNotification({ title: "Retained" }));
    act(() => vi.advanceTimersByTime(2000));
    view.rerender(tree(false));
    act(() => vi.advanceTimersByTime(2000));
    view.rerender(tree(true));
    expect(screen.getByText("Retained")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("Retained")).toBeNull();
    act(() => addNotification({ title: "Expires while hidden" }));
    view.rerender(tree(false));
    act(() => vi.advanceTimersByTime(5000));
    view.rerender(tree(true));
    expect(screen.queryByText("Expires while hidden")).toBeNull();
  });
});
