import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthLoginBody } from "@/common/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/common/lib/notifications";

import { INVITE_CODE_KEY } from "../model/constants.ts";
import { useLogin } from "../model/useLogin.ts";

const telegram_widget_config = {
  botName: import.meta.env.VITE_TELEGRAM_BOT_NAME,
  src: "https://telegram.org/js/telegram-widget.js?22",
  btnSize: "large",
};

export function ByTelegram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { login } = useLogin();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.onTelegramAuth = async (user) => {
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

    const script = document.createElement("script");
    script.src = telegram_widget_config.src;
    script.async = true;
    script.setAttribute("data-telegram-login", telegram_widget_config.botName);
    script.setAttribute("data-size", telegram_widget_config.btnSize);
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    container.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [login, addNotification, navigate]);

  return <div ref={containerRef} />;
}
