import { Outlet } from "@tanstack/react-router";

import { Navigation } from "@/modules/navigation";
import { useMe } from "@/modules/user";

import { AuthLoadingBoundary } from "./auth-loading-boundary.tsx";

import s from "./private.module.css";

export function PrivateLayout() {
  const { privateLifetime } = useMe();

  return (
    <main className={s.main}>
      <Navigation />
      <AuthLoadingBoundary key={privateLifetime}>
        <Outlet />
      </AuthLoadingBoundary>
    </main>
  );
}
