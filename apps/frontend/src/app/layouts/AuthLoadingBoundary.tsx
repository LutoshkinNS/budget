import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Loader } from "@/common/ui/loader/Loader.tsx";
import { useMe } from "@/modules/user";

const AUTH_LOAD_TIMEOUT_MS = 12_000;

type AuthLoadingBoundaryProps = {
  children: React.ReactNode;
};

export function AuthLoadingBoundary({ children }: AuthLoadingBoundaryProps) {
  const { isLoading, error } = useMe();
  const navigate = useNavigate();
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    if (error?.statusCode === 401) {
      void navigate({ to: "/login", replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!isLoading) {
      setAuthTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthTimedOut(true);
    }, AUTH_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  useEffect(() => {
    if (authTimedOut) {
      void navigate({ to: "/login", replace: true });
    }
  }, [authTimedOut, navigate]);

  if (isLoading && !authTimedOut) {
    return <Loader />;
  }

  if (error?.statusCode === 401 || authTimedOut) {
    return null;
  }

  return children;
}
