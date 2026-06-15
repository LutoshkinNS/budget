import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";

import { GlobalLoader, Loader } from "@/common/ui/loader/Loader.tsx";
import { Navigation } from "@/common/ui/navigation/Navigation.tsx";
import { useMe } from "@/modules/user";

import s from "./private.module.css";

export function PrivateLayout() {
  const { isLoading, error } = useMe();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!!error && error.statusCode === 401) {
      void navigate({ to: "/login", replace: true });
    }
  }, [error, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (error?.statusCode === 401) {
    return null;
  }

  return (
    <main className={s.main}>
      <GlobalLoader />
      <Navigation />
      <Outlet />
    </main>
  );
}
