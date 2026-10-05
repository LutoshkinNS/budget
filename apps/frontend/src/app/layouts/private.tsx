import { Outlet } from "@tanstack/react-router";

import { GlobalLoader } from "@/common/ui/loader/Loader.tsx";
import { Navigation } from "@/modules/navigation";

import { AuthLoadingBoundary } from "./AuthLoadingBoundary.tsx";

import s from "./private.module.css";

export function PrivateLayout() {
  return (
    <AuthLoadingBoundary>
      <main className={s.main}>
        <GlobalLoader />
        <Navigation />
        <Outlet />
      </main>
    </AuthLoadingBoundary>
  );
}
