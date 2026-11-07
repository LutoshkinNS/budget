import { useAccountsCreateInvitation } from "@/common/api/generate/accounts/accounts.gen.ts";
import { AccountsCreateInvitationResponse } from "@/common/api/generate/accounts/accounts.zod.gen.ts";

export function useCreateInvitation() {
  const { mutateAsync, ...mutation } = useAccountsCreateInvitation({
    mutation: { meta: { localFeedback: true } },
  });

  async function createInvitation(accountId: number) {
    const response = await mutateAsync({ accountId });
    const result = AccountsCreateInvitationResponse.safeParse(response);

    if (!result.success || result.data.accountId !== accountId) {
      throw new Error("Не удалось создать приглашение для этого счёта");
    }

    return result.data;
  }

  return { createInvitation, ...mutation };
}
