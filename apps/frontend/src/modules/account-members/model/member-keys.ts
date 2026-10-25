import { accountKeys } from "@/common/api/query-keys";

export const memberKeys = {
  all: (accountId: number) =>
    [...accountKeys.root(accountId), "members"] as const,
};
