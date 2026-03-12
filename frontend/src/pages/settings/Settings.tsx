import {
  AccountsSelect,
  InviteToAccount,
  RenameAccount,
} from "@/features/accounts";

export function Settings() {
  return (
    <div>
      <AccountsSelect />
      <InviteToAccount />
      <RenameAccount />
    </div>
  );
}
