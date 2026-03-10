import { ByTelegram } from "@/features/auth";

import s from "./login.module.css";

export function Login() {
  return (
    <div className={s.loginContainer}>
      <ByTelegram />
    </div>
  );
}
