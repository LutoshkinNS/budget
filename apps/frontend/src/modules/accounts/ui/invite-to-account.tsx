import { useMe } from "@/modules/user";

import { InviteAccountRow } from "./invite-account-row.tsx";

import styles from "./invite-to-account.module.css";

export function InviteToAccount() {
  const { data: me } = useMe();
  const ownedAccounts = me?.accounts.filter((account) => account.isOwner) ?? [];

  if (!me || ownedAccounts.length === 0) return null;

  return (
    <fieldset className={styles.group}>
      <legend>Пригласить в аккаунт</legend>
      {ownedAccounts.map((account) => (
        <InviteAccountRow
          key={me.userId + "-" + account.id}
          account={account}
        />
      ))}
    </fieldset>
  );
}
