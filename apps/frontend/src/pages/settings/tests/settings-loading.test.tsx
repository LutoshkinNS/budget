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

import { queryClient } from "@/common/api/appQuery";
import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen";
import { deferred } from "@/common/api/tests/deferred";
import { Notifications } from "@/common/lib/notifications";
import { getSessionContext } from "@/modules/user";

import { Settings } from "..";

vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}));

const meKey = getAuthMeQueryKey();
const ownedA = {
  id: 41,
  name: "Первый счёт",
  initialBalance: 10,
  isOwner: true,
};
const ownedB = {
  id: 42,
  name: "Второй счёт",
  initialBalance: 20,
  isOwner: true,
};
const member = {
  id: 43,
  name: "Гостевой счёт",
  initialBalance: 30,
  isOwner: false,
};
const profile = { userId: 1, accounts: [ownedA, ownedB, member] };
const fetchMock = vi.fn<typeof fetch>();

function seedSession(me = profile) {
  const session = getSessionContext(queryClient);
  const login = session.beginCommand("login");
  queryClient.clear();
  session.apply(login, { type: "login-success" });
  session.apply(login, { type: "me-valid", actorId: me.userId });
  queryClient.setQueryData(meKey, me);
}

function settings() {
  render(
    <QueryClientProvider client={queryClient}>
      <Notifications>
        <Settings />
      </Notifications>
    </QueryClientProvider>,
  );
}

function updateResponse(name: string) {
  return Response.json({
    id: ownedA.id,
    name,
    initialBalance: 25.5,
    ownerId: profile.userId,
    createdAt: "2026-10-15T09:18:27.000Z",
  });
}

function invitation(accountId: number, code: string) {
  return Response.json({
    id: accountId,
    accountId,
    code,
    expiresAt: "2026-11-08T10:00:00.000Z",
  });
}

function form() {
  return within(
    screen.getByRole("group", { name: "Настройки выбранного аккаунта" }),
  );
}

function edit(name: string) {
  fireEvent.click(form().getByRole("button", { name: "Изменить" }));
  const input = form().getByRole("textbox", { name: "Название аккаунта" });
  fireEvent.change(input, { target: { value: name } });
  return input;
}

function row(accountName: string) {
  const invitations = within(
    screen.getByRole("group", { name: "Пригласить в аккаунт" }),
  );
  const group = invitations.queryByRole("group", { name: accountName });
  if (group) return within(group);
  const name = invitations.getByText(accountName, { exact: false });
  const container = name.closest("li") ?? name.parentElement;
  if (!container) throw new Error(`Missing invitation row for ${accountName}`);
  return within(container);
}

beforeEach(() => {
  queryClient.setDefaultOptions({
    queries: { retry: false, staleTime: 60_000 },
    mutations: { retry: false },
  });
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  seedSession();
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("settings mutations", () => {
  it("keeps adjacent controls usable and preserves the draft when a guarded rename fails", async () => {
    const pending = deferred<Response>();
    fetchMock.mockReturnValueOnce(pending.promise);
    settings();
    const input = edit("Новый черновик");
    const save = form().getByRole("button", { name: "Сохранить" });
    try {
      act(() => {
        fireEvent.click(save);
        fireEvent.click(save);
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/accounts/41",
        expect.objectContaining({
          method: "PATCH",
          body: '{"name":"Новый черновик"}',
        }),
      );
      expect(form().getByRole("status")).not.toBeNull();
      expect(input).toHaveProperty("disabled", true);
      expect(screen.getByRole("combobox")).toHaveProperty("disabled", false);
      expect(
        row(ownedB.name).getByRole("button", { name: /пригласить/i }),
      ).toHaveProperty("disabled", false);
      expect(screen.getByRole("button", { name: "Выйти" })).toHaveProperty(
        "disabled",
        false,
      );

      pending.reject(new TypeError("Disconnected"));
      expect(await form().findByRole("alert")).not.toBeNull();
      expect(input).toHaveProperty("value", "Новый черновик");
      expect(save).toHaveProperty("disabled", false);
    } finally {
      pending.resolve(updateResponse("Новый черновик"));
    }
  });

  it("patches only the target account and closes the form before a fresh GET can finish", async () => {
    const beforeUpdate = deferred<Response>();
    const afterUpdate = deferred<Response>();
    const reads = vi
      .fn()
      .mockReturnValueOnce(beforeUpdate.promise)
      .mockReturnValueOnce(afterUpdate.promise);
    fetchMock.mockImplementation((url, options) => {
      if (url === "/api/v1/auth/me") return reads();
      if (options?.method === "PATCH")
        return Promise.resolve(updateResponse("Подтверждено сервером"));
      throw new Error(`Unexpected request ${String(url)}`);
    });
    settings();
    const input = edit("Локальное имя");
    const balance = form().getByRole("textbox", { name: "Начальный баланс" });
    fireEvent.change(balance, { target: { value: "25,5" } });
    try {
      act(() => {
        void queryClient.invalidateQueries({ queryKey: meKey });
      });
      await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
      const olderRead = fetchMock.mock.calls[0]?.[1]?.signal;
      expect(input).toHaveProperty("value", "Локальное имя");
      fireEvent.click(form().getByRole("button", { name: "Сохранить" }));
      await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
      expect(olderRead?.aborted).toBe(true);
      expect(await form().findByText("Подтверждено сервером")).not.toBeNull();
      const freshRequest = fetchMock.mock.calls.filter(
        ([url]) => url === "/api/v1/auth/me",
      )[1]?.[1];
      expect(freshRequest?.signal?.aborted).toBe(false);
      expect(form().queryByRole("status")).toBeNull();
      const expected = {
        ...profile,
        accounts: [
          { ...ownedA, name: "Подтверждено сервером", initialBalance: 25.5 },
          ownedB,
          member,
        ],
      };
      expect(queryClient.getQueryData(meKey)).toEqual(expected);

      await act(async () => {
        beforeUpdate.resolve(Response.json(profile));
      });
      expect(queryClient.getQueryData(meKey)).toEqual(expected);
      await act(async () => {
        afterUpdate.resolve(Response.json(expected));
      });
    } finally {
      beforeUpdate.resolve(Response.json(profile));
      afterUpdate.resolve(Response.json(profile));
    }
  });

  it("does not close a newly opened draft after A → B → A and a delayed rename", async () => {
    const pending = deferred<Response>();
    fetchMock.mockReturnValueOnce(pending.promise);
    fetchMock.mockImplementation(() => Promise.resolve(Response.json(profile)));
    settings();
    edit("Первый запрос");
    try {
      fireEvent.click(form().getByRole("button", { name: "Сохранить" }));
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/v1/accounts/41",
          expect.objectContaining({ method: "PATCH" }),
        ),
      );
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: String(ownedB.id) } });
      fireEvent.change(select, { target: { value: String(ownedA.id) } });
      const draft = edit("Новый экземпляр");

      await act(async () => {
        pending.resolve(updateResponse("Старый ответ"));
      });
      await waitFor(() => expect(queryClient.isMutating()).toBe(0));

      expect(draft).toHaveProperty("value", "Новый экземпляр");
      expect(form().getByRole("textbox", { name: "Название аккаунта" })).toBe(
        draft,
      );
    } finally {
      pending.resolve(updateResponse("Старый ответ"));
    }
  });

  it("does not overwrite the new A response with a retired A editor after A to B to A", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const reads = deferred<void>();
    const freshProfile = {
      ...profile,
      accounts: [
        { ...ownedA, name: "Сохранённый A2", initialBalance: 25.5 },
        ownedB,
        member,
      ],
    };
    let writes = 0;
    const profileSignals: (AbortSignal | null | undefined)[] = [];
    fetchMock.mockImplementation((url, options) => {
      if (options?.method === "PATCH") {
        writes += 1;
        return writes === 1 ? first.promise : second.promise;
      }
      if (url === "/api/v1/auth/me") {
        profileSignals.push(options?.signal);
        return reads.promise.then(() => Response.json(freshProfile));
      }
      throw new Error(`Unexpected request ${String(url)}`);
    });
    settings();
    edit("Запрос A1");
    try {
      fireEvent.click(form().getByRole("button", { name: "Сохранить" }));
      await waitFor(() => expect(writes).toBe(1));
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: String(ownedB.id) } });
      fireEvent.change(select, { target: { value: String(ownedA.id) } });
      edit("Запрос A2");
      fireEvent.click(form().getByRole("button", { name: "Сохранить" }));
      await waitFor(() => expect(writes).toBe(2));
      second.resolve(updateResponse("Сохранённый A2"));
      await form().findByText("Сохранённый A2");
      expect(queryClient.getQueryData(meKey)).toEqual(freshProfile);
      await waitFor(() => expect(profileSignals.length).toBe(1));
      const currentRead = profileSignals[0];
      expect(currentRead?.aborted).toBe(false);
      await act(async () => {
        first.resolve(updateResponse("Устаревший A1"));
      });
      await waitFor(() => expect(queryClient.isMutating()).toBe(0));
      expect(queryClient.getQueryData(meKey)).toEqual(freshProfile);
      expect(currentRead?.aborted).toBe(false);
      expect(form().getByText("Сохранённый A2")).not.toBeNull();
      reads.resolve();
    } finally {
      first.resolve(updateResponse("Устаревший A1"));
      second.resolve(updateResponse("Сохранённый A2"));
      reads.resolve();
    }
  });

  it("keeps concurrent invites, errors and copy controls bound to their own rows", async () => {
    const inviteA = deferred<Response>();
    const inviteB = deferred<Response>();
    const copyA = deferred<void>();
    fetchMock.mockImplementation((url) => {
      if (url === "/api/v1/accounts/41/invitations") return inviteA.promise;
      if (url === "/api/v1/accounts/42/invitations") return inviteB.promise;
      throw new Error(`Unexpected request ${String(url)}`);
    });
    const clipboard = vi
      .fn<Clipboard["writeText"]>()
      .mockReturnValueOnce(copyA.promise)
      .mockResolvedValue();
    const previousClipboard = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboard },
    });
    settings();
    try {
      const first = row(ownedA.name).getByRole("button", {
        name: /пригласить/i,
      });
      const second = row(ownedB.name).getByRole("button", {
        name: /пригласить/i,
      });
      act(() => {
        fireEvent.click(first);
        fireEvent.click(first);
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(second).toHaveProperty("disabled", false);
      fireEvent.click(second);
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

      inviteB.resolve(invitation(42, "second-code"));
      expect(
        await row(ownedB.name).findByText(/\/invite\/second-code/),
      ).not.toBeNull();
      expect(row(ownedA.name).queryByText(/second-code/)).toBeNull();
      inviteA.resolve(invitation(42, "wrong-account"));
      expect(await row(ownedA.name).findByRole("alert")).not.toBeNull();
      expect(screen.queryByText(/wrong-account/)).toBeNull();
      fetchMock.mockResolvedValueOnce(invitation(41, "first-code"));
      fireEvent.click(
        row(ownedA.name).queryByRole("button", { name: /повторить/i }) ??
          row(ownedA.name).getByRole("button", { name: /пригласить/i }),
      );
      expect(
        await row(ownedA.name).findByText(/\/invite\/first-code/),
      ).not.toBeNull();

      fireEvent.click(
        row(ownedA.name).getByRole("button", { name: /копировать/i }),
      );
      fireEvent.click(
        row(ownedB.name).getByRole("button", { name: /копировать/i }),
      );
      expect(clipboard.mock.calls).toEqual([
        [`${window.location.origin}/invite/first-code`],
        [`${window.location.origin}/invite/second-code`],
      ]);
      const copied = "Ссылка скопирована в буфер обмена";
      expect(await row(ownedB.name).findByText(copied)).not.toBeNull();
      expect(row(ownedA.name).queryByText(copied)).toBeNull();
      copyA.resolve(undefined);
      expect(await row(ownedA.name).findByText(copied)).not.toBeNull();
      expect(
        screen.queryByText(member.name, { exact: false, selector: "span" }),
      ).toBeNull();
    } finally {
      inviteA.resolve(invitation(41, "first-code"));
      inviteB.resolve(invitation(42, "second-code"));
      copyA.resolve(undefined);
      if (previousClipboard)
        Object.defineProperty(navigator, "clipboard", previousClipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("does not revive a previous owner's rename or invite after the session changes", async () => {
    const rename = deferred<Response>();
    const invite = deferred<Response>();
    const nextAccount = { ...ownedA, name: "Счёт нового пользователя" };
    const nextProfile = { userId: 2, accounts: [nextAccount] };
    fetchMock.mockImplementation((url, options) => {
      if (options?.method === "PATCH") return rename.promise;
      if (url === "/api/v1/accounts/41/invitations") return invite.promise;
      if (url === "/api/v1/auth/me")
        return Promise.resolve(Response.json(nextProfile));
      throw new Error(`Unexpected request ${String(url)}`);
    });
    settings();
    edit("Запрос первого пользователя");
    try {
      fireEvent.click(form().getByRole("button", { name: "Сохранить" }));
      fireEvent.click(
        row(ownedA.name).getByRole("button", { name: /пригласить/i }),
      );
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

      act(() => {
        seedSession(nextProfile);
      });
      await screen.findByRole("option", { name: nextAccount.name });
      const draft = edit("Черновик нового пользователя");
      await act(async () => {
        rename.resolve(updateResponse("Запоздалое имя"));
        invite.resolve(invitation(41, "obsolete-code"));
      });

      expect(queryClient.getQueryData(meKey)).toEqual(nextProfile);
      expect(draft).toHaveProperty("value", "Черновик нового пользователя");
      expect(row(nextAccount.name).queryByText(/obsolete-code/)).toBeNull();
    } finally {
      rename.resolve(updateResponse("Запоздалое имя"));
      invite.resolve(invitation(41, "obsolete-code"));
    }
  });

  it("keeps editing unavailable after selecting an account where the actor is only a member", () => {
    settings();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: String(member.id) },
    });
    expect(form().queryByRole("button", { name: "Изменить" })).toBeNull();
    expect(form().getByText(/только владелец/i)).not.toBeNull();
    expect(screen.queryByRole("group", { name: member.name })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows no account mutations for an authorized user without accounts", () => {
    seedSession({ ...profile, accounts: [] });
    settings();
    expect(
      screen.getByRole("option", { name: "Аккаунтов не найдено" }),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Изменить" })).toBeNull();
    expect(screen.queryByRole("button", { name: /пригласить/i })).toBeNull();
    expect(screen.getByRole("button", { name: "Выйти" })).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
