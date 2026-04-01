import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";

import { Loader } from "@/common/ui/loader/Loader.tsx";
import { Navigation } from "@/common/ui/navigation/Navigation.tsx";
import { useMe } from "@/modules/user";

export function PrivateLayout() {
  const { isLoading, error } = useMe();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!!error && error.statusCode === 401) {
      navigate({ to: "/login" });
    }
  }, [error, navigate]);

  if (isLoading || error?.statusCode === 401) {
    return <Loader />;
  }

  return (
    <div>
      <Navigation />
      <Outlet />
    </div>
  );
}
