import { useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { getAuthMeQueryKey } from "@/common/api/generate/authentication/authentication.gen.ts";
import { AuthLoginBody } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import { INVITE_CODE_KEY } from "../model/constants.ts";
import { useLogin } from "../model/useLogin.ts";

import s from "./ByTelegram.module.css";

const telegram_widget_config = {
  botName: import.meta.env.VITE_TELEGRAM_BOT_NAME,
  src: "https://telegram.org/js/telegram-widget.js?22",
  btnSize: "large",
};

const TELEGRAM_WIDGET_TIMEOUT_MS = 20000;

export function ByTelegram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFallback, setShowFallback] = useState(false);
  const { login } = useLogin();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.onTelegramAuth = async (user) => {
      setShowFallback(false);

      const validateResult = AuthLoginBody.safeParse(user);

      if (!validateResult.success) {
        const errors = z.prettifyError(validateResult.error);

        addNotification({
          id: "telegram-auth-error",
          title: "Telegram auth error",
          message: errors,
        });

        return;
      }

      const result = await login({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: user.auth_date,
        hash: user.hash,
      });

      if (result) {
        queryClient.removeQueries({ queryKey: getAuthMeQueryKey() });

        const pendingCode = sessionStorage.getItem(INVITE_CODE_KEY);
        if (pendingCode) {
          sessionStorage.removeItem(INVITE_CODE_KEY);
          await navigate({
            to: "/invite/$code",
            params: { code: pendingCode },
          });
        } else {
          await navigate({ to: "/" });
        }
      }
    };

    if (!telegram_widget_config.botName) {
      setShowFallback(true);
      return;
    }

    setShowFallback(false);

    const script = document.createElement("script");
    script.src = telegram_widget_config.src;
    script.async = true;
    script.setAttribute("data-telegram-login", telegram_widget_config.botName);
    script.setAttribute("data-size", telegram_widget_config.btnSize);
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    container.appendChild(script);

    const timeoutId = window.setTimeout(() => {
      setShowFallback(true);
    }, TELEGRAM_WIDGET_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
      delete window.onTelegramAuth;
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [login, addNotification, queryClient, navigate]);

  async function handleDevLogin() {
    await fetch("/api/v1/auth/dev-login", { credentials: "include" });
    await navigate({ to: "/" });
  }

  return (
    <div className={s.container}>
      <div ref={containerRef} />
      {showFallback && (
        <div className={s.fallback} role="status">
          <p>Не получается войти через Telegram?</p>
          <button type="button" onClick={() => window.location.reload()}>
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
