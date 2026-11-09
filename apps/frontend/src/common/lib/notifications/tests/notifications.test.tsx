import type { PropsWithChildren } from "react";
import { act, cleanup, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Notifications } from "../Notifications";
import { useNotifications } from "../useNotifications";

const wrapper = ({ children }: PropsWithChildren) => (
  <Notifications>{children}</Notifications>
);
const content = { title: "Ошибка", message: "Одинаковый текст" };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("notification identity and content deduplication", () => {
  it("deduplicates ordinary content and keeps the add callback stable across notifications", () => {
    const { result } = renderHook(useNotifications, { wrapper });
    const add = result.current.addNotification;
    act(() => {
      add({ id: "ordinary-1", ...content });
      add({ id: "ordinary-2", ...content });
    });
    expect(screen.getAllByText(content.message)).toHaveLength(1);
    expect(result.current.addNotification).toBe(add);
  });

  it.each([true, false])(
    "does not merge a query notification with ordinary content in either insertion order (%s)",
    (queryFirst) => {
      const { result } = renderHook(useNotifications, { wrapper });
      const query = { id: "query", ...content, deduplicateByContent: false };
      const ordinary = { id: "ordinary", ...content };
      act(() => {
        result.current.addNotification(queryFirst ? query : ordinary);
        result.current.addNotification(queryFirst ? ordinary : query);
        result.current.addNotification(query);
      });
      expect(screen.getAllByText(content.message)).toHaveLength(2);
      act(() => result.current.deleteNotification("query"));
      expect(screen.getAllByText(content.message)).toHaveLength(1);
    },
  );

  it("expires independent query notifications five seconds after their own insertion", () => {
    vi.useFakeTimers();
    const { result } = renderHook(useNotifications, { wrapper });
    act(() =>
      result.current.addNotification({
        id: "first",
        ...content,
        deduplicateByContent: false,
      }),
    );
    act(() => vi.advanceTimersByTime(1000));
    act(() =>
      result.current.addNotification({
        id: "second",
        ...content,
        deduplicateByContent: false,
      }),
    );
    expect(screen.getAllByText(content.message)).toHaveLength(2);
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getAllByText(content.message)).toHaveLength(1);
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getAllByText(content.message)).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText(content.message)).toBeNull();
  });
});
