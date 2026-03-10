import { useMe } from "@/entities/user";
import { AccountsSelect, InviteToAccount } from "@/features/accounts";

export function Settings() {
  const { data: me } = useMe();
  const ownedAccounts = me?.accounts.filter((a) => a.isOwner) ?? [];

  return (
    <div>
      <AccountsSelect />

      {ownedAccounts.length > 0 && (
        <div>
          <h3>Пригласить в аккаунт</h3>
          {ownedAccounts.map((account) => (
            <div key={account.id}>
              <span>{account.name}</span>
              <InviteToAccount accountId={account.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
