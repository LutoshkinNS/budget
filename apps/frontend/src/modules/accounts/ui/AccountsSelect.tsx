import { FormBlock } from "@/common/ui/form-block/FormBlock.tsx";
import { useMe, useSwitchAccount } from "@/modules/user";

const IDS = {
  SELECT: "select",
} as const;

const FIELD_VALUES = {
  ACCOUNT_ID: "account_id",
} as const;

export function AccountsSelect() {
  const { data: me } = useMe();
  const { mutate: switchAccount, isPending } = useSwitchAccount();

  const accounts = me?.accounts ?? [];
  const currentAccountId = me?.currentAccountId;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = Number(e.target.value);
    if (accountId && accountId !== currentAccountId) {
      switchAccount({ data: { accountId } });
    }
  };

  return (
    <FormBlock legend={"Текущий аккаунт"}>
      <select
        name={FIELD_VALUES.ACCOUNT_ID}
        id={IDS.SELECT}
        value={currentAccountId ?? ""}
        onChange={handleChange}
        disabled={isPending}
      >
        {accounts.length === 0 ? (
          <option value="">Аккаунтов не найдено</option>
        ) : null}
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </FormBlock>
  );
}
