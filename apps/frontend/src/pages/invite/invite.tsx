import { useCallback } from "react";

import { InvitationRedemption } from "@/modules/accounts";
import { INVITE_CODE_KEY } from "@/modules/auth";

import styles from "./invite.module.css";

export type InviteProps = {
  code: string;
  navigateToLogin(): void;
  navigateHome(): void;
};

export function Invite({ code, navigateToLogin, navigateHome }: InviteProps) {
  const requireAuthentication = useCallback(() => {
    sessionStorage.setItem(INVITE_CODE_KEY, code);
    navigateToLogin();
  }, [code, navigateToLogin]);

  return (
    <main className={styles.container}>
      <InvitationRedemption
        key={code}
        code={code}
        onAuthenticationRequired={requireAuthentication}
        onRedeemed={navigateHome}
      />
    </main>
  );
}
