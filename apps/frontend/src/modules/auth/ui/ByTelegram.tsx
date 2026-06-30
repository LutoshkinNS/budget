import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthLoginBody } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import { INVITE_CODE_KEY } from "../model/constants.ts";
import { reportAuthEvent } from "../model/reportAuthEvent.ts";
import { useLogin } from "../model/useLogin.ts";

import s from "./ByTelegram.module.css";

const telegram_widget_config = {
  botName: import.meta.env.VITE_TELEGRAM_BOT_NAME,
  src: "https://telegram.org/js/telegram-widget.js?22",
  btnSize: "large",
};

const TELEGRAM_WIDGET_TIMEOUT_MS = 20000;
type TelegramUser = Parameters<NonNullable<Window["onTelegramAuth"]>>[0];

export function ByTelegram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const authInProgressRef = useRef(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const { login } = useLogin();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const loginRef = useRef(login);
  const addNotificationRef = useRef(addNotification);
  const queryClientRef = useRef(queryClient);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    void reportAuthEvent("page_loaded");
  }, []);

  useLayoutEffect(() => {
    loginRef.current = login;
    addNotificationRef.current = addNotification;
    queryClientRef.current = queryClient;
    navigateRef.current = navigate;
  }, [login, addNotification, queryClient, navigate]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    let script: HTMLScriptElement | undefined;
    let timeoutId: number | undefined;

    const authenticate = async (user: TelegramUser) => {
      if (authInProgressRef.current) return;

      authInProgressRef.current = true;
      const attemptId = crypto.randomUUID();
      const eventOptions = { attemptId };

      void reportAuthEvent("auth_callback", eventOptions);
      setShowFallback(false);

      const validateResult = AuthLoginBody.safeParse(user);

      if (!validateResult.success) {
        const errors = z.prettifyError(validateResult.error);

        addNotificationRef.current({
          id: "telegram-auth-error",
          title: "Telegram auth error",
          message: errors,
        });
        void reportAuthEvent("login_failed", eventOptions);
        authInProgressRef.current = false;

        return;
      }

      void reportAuthEvent("login_started", eventOptions);
      setIsLoginPending(true);

      try {
        const result = await loginRef.current({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: user.auth_date,
          hash: user.hash,
        });

        if (result) {
          void reportAuthEvent("login_succeeded", eventOptions);
          queryClientRef.current.removeQueries({
            queryKey: getAuthMeQueryKey(),
          });

          const pendingCode = sessionStorage.getItem(INVITE_CODE_KEY);
          if (pendingCode) {
            sessionStorage.removeItem(INVITE_CODE_KEY);
            await navigateRef.current({
              to: "/invite/$code",
              params: { code: pendingCode },
            });
          } else {
            await navigateRef.current({ to: "/" });
          }
        } else {
          void reportAuthEvent("login_failed", eventOptions);
        }
      } catch {
        void reportAuthEvent("login_failed", eventOptions);
      } finally {
        authInProgressRef.current = false;
        if (mounted) setIsLoginPending(false);
      }
    };

    const handleTelegramAuth = (user: TelegramUser) => {
      void authenticate(user);
    };

    window.onTelegramAuth = handleTelegramAuth;

    if (!telegram_widget_config.botName) {
      setShowFallback(true);
    } else {
      setShowFallback(false);

      script = document.createElement("script");
      script.src = telegram_widget_config.src;
      script.async = true;
      script.setAttribute(
        "data-telegram-login",
        telegram_widget_config.botName,
      );
      script.setAttribute("data-size", telegram_widget_config.btnSize);
      script.setAttribute("data-onauth", "onTelegramAuth(user)");

      const handleScriptLoaded = () => {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
          timeoutId = undefined;
        }
        setShowFallback(false);
        void reportAuthEvent("widget_script_loaded");
      };
      const handleScriptFailed = () => {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
          timeoutId = undefined;
        }
        setShowFallback(true);
        void reportAuthEvent("widget_script_failed");
      };

      script.addEventListener("load", handleScriptLoaded);
      script.addEventListener("error", handleScriptFailed);

      container.appendChild(script);

      timeoutId = window.setTimeout(() => {
        setShowFallback(true);
      }, TELEGRAM_WIDGET_TIMEOUT_MS);
    }

    return () => {
      mounted = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (window.onTelegramAuth === handleTelegramAuth) {
        delete window.onTelegramAuth;
      }
      if (script && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  async function handleDevLogin() {
    await fetch("/api/v1/auth/dev-login", { credentials: "include" });
    await navigate({ to: "/" });
  }

  return (
    <div className={s.container}>
      <div ref={containerRef} />
      {isLoginPending && <p role="status">Выполняется вход…</p>}
      {showFallback && (
        <div className={s.fallback} role="status">
          <p>Не получается войти через Telegram?</p>
          <button
            type="button"
            disabled={isLoginPending}
            onClick={() => {
              if (!isLoginPending) window.location.reload();
            }}
          >
            Обновить страницу
          </button>
        </div>
      )}
      {import.meta.env.DEV && (
        <button onClick={handleDevLogin}>Dev login</button>
      )}
    </div>
  );
}
