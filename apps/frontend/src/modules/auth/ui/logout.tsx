import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { getSessionContext } from "@/modules/user";

import { useLogout } from "../model/use-logout.ts";

export function Logout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, isPending, error } = useLogout();

  async function handleLogout() {
    const result = await logout();
    if (
      result.status === "accepted" &&
      getSessionContext(queryClient).isCurrent(result.token)
    ) {
      await navigate({ to: "/login" });
    }
  }

  return (
    <div>
      <button type="button" disabled={isPending} onClick={handleLogout}>
        Выйти
      </button>
      {isPending && <p role="status">Выполняется выход…</p>}
      {error && <p role="alert">Не удалось выйти. Попробуйте ещё раз.</p>}
    </div>
  );
}
