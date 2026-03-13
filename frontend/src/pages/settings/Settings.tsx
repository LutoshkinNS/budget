import {
  AccountsSelect,
  InviteToAccount,
  RenameAccount,
} from "@/modules/accounts";

export function Settings() {
  return (
    <div>
      <AccountsSelect />
      <InviteToAccount />
      <RenameAccount />
    </div>
  );
}
