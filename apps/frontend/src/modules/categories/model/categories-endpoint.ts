import type { ApiTransport } from "@/common/api/api-runtime.ts";
import { getCategoriesListUrl } from "@/common/api/generate/categories/categories.gen.ts";
import { CategoriesListResponse } from "@/common/api/generate/categories/categories.zod.gen.ts";
import type { CategoriesListParams } from "@/common/api/generate/model";

export function requestCategoriesList(
  transport: ApiTransport,
  accountId: number,
  params: CategoriesListParams | undefined,
  signal: AbortSignal,
) {
  const schema = CategoriesListResponse.refine((rows) =>
    rows.every((row) => row.accountId === accountId),
  );

  return transport.requestValidated(
    getCategoriesListUrl(accountId, params),
    {
      method: "GET",
      operation: "categoriesList",
      signal,
    },
    schema,
  );
}
