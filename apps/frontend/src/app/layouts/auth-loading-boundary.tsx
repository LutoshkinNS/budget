import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { Skeleton } from "@/common/ui/skeleton/skeleton";
import { useMe } from "@/modules/user";

import styles from "./auth-loading-boundary.module.css";

const AUTH_LOAD_TIMEOUT_MS = 12_000;

type AuthLoadingBoundaryProps = {
  children: React.ReactNode;
};

export function AuthLoadingBoundary({ children }: AuthLoadingBoundaryProps) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    isUnauthorized,
    error,
    refetch,
  } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const redirectStartedRef = useRef(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    if ((isUnauthorized || authTimedOut) && !redirectStartedRef.current) {
      redirectStartedRef.current = true;
      void navigate({ to: "/login", replace: true });
    }
  }, [authTimedOut, isUnauthorized, navigate]);

  useEffect(() => {
    if (!isLoading || authTimedOut) return;
    const timeoutId = window.setTimeout(
      () => {
        setAuthTimedOut(true);
        void queryClient.cancelQueries({
          queryKey: getAuthMeQueryKey(),
          exact: true,
        });
      },
      AUTH_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [authTimedOut, isLoading, queryClient]);

  if (isUnauthorized || authTimedOut) return null;
  if (data) {
    return (
      <>
        {isError && (
          <p className={styles.refreshStatus} role="status">
            Не удалось обновить данные авторизации.
            <button type="button" onClick={() => void refetch()}>
              Повторить
            </button>
          </p>
        )}
        {!isError && isFetching && (
          <p className={styles.refreshStatus} role="status">
            Обновляем данные авторизации…
          </p>
        )}
        {children}
      </>
    );
  }
  if (isError) {
    return (
      <section className={styles.error} aria-labelledby="auth-error-title">
        <h1 id="auth-error-title">Не удалось проверить вход</h1>
        <p role="alert">{error?.message ?? "Повторите запрос."}</p>
        <button type="button" onClick={() => void refetch()}>
          Повторить
        </button>
      </section>
    );
  }
  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-label="Проверка входа">
        <Skeleton className={styles.loadingLine ?? ""} />
        <Skeleton className={styles.loadingCard ?? ""} />
      </div>
    );
  }
  return (
    <section className={styles.error} aria-label="Проверка входа">
      <p role="status">Проверяем вход…</p>
      <button type="button" onClick={() => void refetch()}>
        Повторить
      </button>
    </section>
  );
}
