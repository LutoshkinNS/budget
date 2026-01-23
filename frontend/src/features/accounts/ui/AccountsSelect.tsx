import { useAccounts } from "@/entities/accounts";

const IDS = {
  SELECT: "select",
} as const;

const FIELD_VALUES = {
  ACCOUNT_ID: "account_id",
} as const;

type AccountSelectProps = React.ComponentPropsWithoutRef<"select">;

export function AccountsSelect(props: AccountSelectProps) {
  const { data: accountsResponse } = useAccounts();

  return (
    <div>
      <label htmlFor={IDS.SELECT}>Аккаунт</label>
      <select
        name={FIELD_VALUES.ACCOUNT_ID}
        id={IDS.SELECT}
        value={accountsResponse[0]?.id ?? ""}
        {...props}
      >
        {!accountsResponse || !accountsResponse.length ? (
          <option value="">Аккаунтов не найдено</option>
        ) : null}
        {accountsResponse.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </div>
  );
}
