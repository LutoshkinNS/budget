import { useLayoutEffect, useRef } from "react";
import { z } from "zod";

import { useLogin } from "@/features/auth/model/useLogin.ts";
import { authLoginBody } from "@/kernel/api/generate/authentication/authentication.zod.gen.ts";
import { useNotifications } from "@/shared/lib/notifications";

const telegram_widget_config = {
  botName: "budget1111_bot",
  src: "https://telegram.org/js/telegram-widget.js?22",
  btnSize: "large",
};

export function ByTelegram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { login } = useLogin();
  const { addNotification } = useNotifications();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.onTelegramAuth = async (user) => {
      const validateResult = authLoginBody.safeParse(user);

      if (!validateResult.success) {
        const errors = z.prettifyError(validateResult.error);

        addNotification({
          id: "telegram-auth-error",
          title: "Telegram auth error",
          message: errors,
        });

        return;
      }

      await login({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: user.auth_date,
        hash: user.hash,
      });
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
  }, []);

  return <div ref={containerRef} />;
}
