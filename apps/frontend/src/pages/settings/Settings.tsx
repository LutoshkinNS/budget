import {
  AccountsSelect,
  InviteToAccount,
  RenameAccount,
} from "@/modules/accounts";
import { Logout } from "@/modules/auth";

export function Settings() {
  return (
    <div>
      <AccountsSelect />
      <InviteToAccount />
      <RenameAccount />
      <Logout />
    </div>
  );
}
