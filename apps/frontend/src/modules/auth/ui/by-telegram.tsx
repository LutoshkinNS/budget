import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthLoginBody } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";
import { getSessionContext } from "@/modules/user";

import { INVITE_CODE_KEY } from "../model/constants.ts";
import { reportAuthEvent } from "../model/report-auth-event.ts";
import { useLogin } from "../model/use-login.ts";

import s from "./by-telegram.module.css";

const telegramWidgetConfig = {
  botName: import.meta.env.VITE_TELEGRAM_BOT_NAME,
  src: "https://telegram.org/js/telegram-widget.js?22",
  btnSize: "large",
};

const TELEGRAM_WIDGET_TIMEOUT_MS = 20000;
type TelegramUser = Parameters<NonNullable<Window["onTelegramAuth"]>>[0];

export function ByTelegram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const authInProgressRef = useRef(false);
  const [showFallback, setShowFallback] = useState(false);
  const { login, devLogin, isPending, error } = useLogin();
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

    activeRef.current = true;
    let script: HTMLScriptElement | undefined;
    let timeoutId: number | undefined;

    const authenticate = async (user: TelegramUser) => {
      if (authInProgressRef.current) return;
      authInProgressRef.current = true;
      const attemptId = crypto.randomUUID();
      const eventOptions = { attemptId };
      void reportAuthEvent("auth_callback", eventOptions);
      setShowFallback(false);

      const validation = AuthLoginBody.safeParse(user);
      if (!validation.success) {
        addNotificationRef.current({
          id: "telegram-auth-error",
          title: "Telegram auth error",
          message: z.prettifyError(validation.error),
        });
        void reportAuthEvent("login_failed", eventOptions);
        authInProgressRef.current = false;
        return;
      }

      void reportAuthEvent("login_started", eventOptions);
      try {
        const result = await loginRef.current(validation.data);
        if (!activeRef.current) return;
        if (result.status !== "accepted") {
          if (result.status === "failed") {
            void reportAuthEvent("login_failed", eventOptions);
          }
          return;
        }

        const session = getSessionContext(queryClientRef.current);
        if (!session.isCurrent(result.token)) return;
        void reportAuthEvent("login_succeeded", eventOptions);

        const pendingCode = sessionStorage.getItem(INVITE_CODE_KEY);
        if (
          pendingCode &&
          session.isCurrent(result.token) &&
          sessionStorage.getItem(INVITE_CODE_KEY) === pendingCode
        ) {
          sessionStorage.removeItem(INVITE_CODE_KEY);
          await navigateRef.current({
            to: "/invite/$code",
            params: { code: pendingCode },
          });
        } else if (session.isCurrent(result.token)) {
          await navigateRef.current({ to: "/" });
        }
      } catch {
        if (activeRef.current) void reportAuthEvent("login_failed", eventOptions);
      } finally {
        authInProgressRef.current = false;
      }
    };

    const handleTelegramAuth = (user: TelegramUser) => {
      void authenticate(user);
    };
    window.onTelegramAuth = handleTelegramAuth;

    if (!telegramWidgetConfig.botName) {
      setShowFallback(true);
    } else {
      setShowFallback(false);
      script = document.createElement("script");
      script.src = telegramWidgetConfig.src;
      script.async = true;
      script.setAttribute("data-telegram-login", telegramWidgetConfig.botName);
      script.setAttribute("data-size", telegramWidgetConfig.btnSize);
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
      timeoutId = window.setTimeout(() => setShowFallback(true), TELEGRAM_WIDGET_TIMEOUT_MS);
    }

    return () => {
      activeRef.current = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (window.onTelegramAuth === handleTelegramAuth) {
        delete window.onTelegramAuth;
      }
      if (script && container.contains(script)) container.removeChild(script);
    };
  }, []);

  async function handleDevLogin() {
    const result = await devLogin();
    if (!activeRef.current || result.status !== "accepted") return;
    const session = getSessionContext(queryClientRef.current);
    if (session.isCurrent(result.token)) await navigateRef.current({ to: "/" });
  }

  return (
    <div className={s.container}>
      <div ref={containerRef} />
      {isPending && <p role="status">Выполняется вход…</p>}
      {error && <p role="alert">Не удалось войти. Проверьте данные и попробуйте ещё раз.</p>}
      {showFallback && (
        <div className={s.fallback} role="status">
          <p>Не получается войти через Telegram?</p>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!isPending) window.location.reload();
            }}
          >
            Обновить страницу
          </button>
        </div>
      )}
      {import.meta.env.DEV && (
        <button type="button" disabled={isPending} onClick={handleDevLogin}>
          Dev login
        </button>
      )}
    </div>
  );
}
