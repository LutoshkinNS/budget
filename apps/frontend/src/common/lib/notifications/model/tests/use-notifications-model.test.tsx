import { type PropsWithChildren, StrictMode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNotificationsModel } from "../use-notifications-model";

const content = { title: "Ошибка", message: "Одинаковый текст" };
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("notification identity and provider lifetime", () => {
  it("keeps equal content with distinct ids and treats string and numeric ids distinctly", () => {
    const { result } = renderHook(useNotificationsModel);
    const add = result.current.addNotification;
    const remove = result.current.deleteNotification;
    act(() => {
      add({ id: 1, ...content });
      add({ id: "1", ...content });
      add({ id: "third", ...content });
    });
    expect(result.current.notifications.map(({ id }) => id)).toEqual([
      1,
      "1",
      "third",
    ]);
    expect(result.current.addNotification).toBe(add);
    expect(result.current.deleteNotification).toBe(remove);
  });

  it("ignores an active duplicate completely, including its content, order and five-second deadline", () => {
    const { result } = renderHook(useNotificationsModel);
    act(() => result.current.addNotification({ id: "same", ...content }));
    act(() => vi.advanceTimersByTime(4000));
    act(() => {
      result.current.addNotification({ id: "other", title: "Второе" });
      result.current.addNotification({ id: "same", title: "Replacement" });
    });
    expect(
      result.current.notifications.map(({ id, title }) => ({ id, title })),
    ).toEqual([
      { id: "same", title: "Ошибка" },
      { id: "other", title: "Второе" },
    ]);
    act(() => vi.advanceTimersByTime(999));
    expect(result.current.notifications).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.notifications.map(({ id }) => id)).toEqual(["other"]);
  });

  it("does not let a removed entry's deadline delete a reused id", () => {
    const { result } = renderHook(useNotificationsModel);
    act(() => result.current.addNotification({ id: "reused", ...content }));
    act(() => vi.advanceTimersByTime(4000));
    act(() => {
      result.current.deleteNotification("reused");
      result.current.addNotification({ id: "reused", title: "New lifetime" });
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.notifications.map(({ title }) => title)).toEqual([
      "New lifetime",
    ]);
    act(() => vi.advanceTimersByTime(3999));
    expect(result.current.notifications).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.notifications).toEqual([]);
  });

  it("allocates unique automatic ids and avoids explicit active ids", () => {
    const { result } = renderHook(useNotificationsModel);
    act(() =>
      result.current.addNotification({
        id: "notification-1",
        title: "Explicit candidate collision",
      }),
    );
    act(() => result.current.addNotification(content));
    expect(result.current.notifications).toHaveLength(2);
    const first = result.current.notifications.find(
      ({ title }) => title === content.title,
    );
    if (!first) throw new Error("Missing generated notification");
    act(() => result.current.deleteNotification(first.id));
    act(() =>
      result.current.addNotification({ id: first.id, title: "Explicit" }),
    );
    act(() => {
      result.current.addNotification(content);
      result.current.addNotification(content);
    });
    const ids = result.current.notifications.map(({ id }) => id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
    expect(
      result.current.notifications
        .filter(({ title }) => title === content.title)
        .map(({ id }) => id),
    ).not.toContain(first.id);
  });

  it("preserves deadlines in StrictMode and clears timers on unmount before rejecting late additions", () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <StrictMode>{children}</StrictMode>
    );
    const { result, rerender, unmount } = renderHook(useNotificationsModel, {
      wrapper,
    });
    const add = result.current.addNotification;
    act(() => add(content));
    act(() => vi.advanceTimersByTime(4000));
    rerender();
    act(() => vi.advanceTimersByTime(999));
    expect(result.current.notifications).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.notifications).toEqual([]);
    act(() => add(content));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => add({ title: "Late" }));
    expect(vi.getTimerCount()).toBe(0);
    const next = renderHook(useNotificationsModel);
    expect(next.result.current.notifications).toEqual([]);
  });
});
