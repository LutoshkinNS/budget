import { GlobalLoader } from "@/common/ui/loader/Loader.tsx";
import { Navigation } from "@/common/ui/navigation/Navigation.tsx";
import { Outlet } from "@tanstack/react-router";

import { AuthLoadingBoundary } from "./AuthLoadingBoundary.tsx";

import s from "./private.module.css";

export function PrivateLayout() {
  return (
    <main className={s.main}>
      <GlobalLoader />
      <Navigation />
      <AuthLoadingBoundary>
        <Outlet />
      </AuthLoadingBoundary>
    </main>
  );
}
