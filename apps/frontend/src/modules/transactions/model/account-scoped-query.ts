import { useCurrentAccountId } from "@/modules/user";

/**
 * Результат query-обёртки модуля: ключ отсутствует, пока счёт неизвестен.
 * С exactOptionalPropertyTypes ключ нельзя передать как undefined,
 * поэтому consumers используют объект целиком (spread в query-опции).
 */
export type AccountScopedQuery = {
  queryKey?: readonly unknown[];
  enabled: boolean;
};

/**
 * Единственная в модуле точка сборки account-guard для query-запросов:
 * запрос без известного счёта не отправляется. Доменные ключи строит
 * колбэк на приватной фабрике модуля — наружу структура ключей не утекает.
 * Дополнительные условия конкретного запроса (например, валидность id)
 * передаются через extraEnabled и объединяются по AND.
 */
export function useAccountScopedQuery(
  buildKey: (accountId: number) => readonly unknown[],
  extraEnabled = true,
): AccountScopedQuery {
  const accountId = useCurrentAccountId();

  return {
    // До загрузки me ключ не переопределяем — остаётся generated-вариант;
    // условный spread вместо queryKey: undefined — exactOptionalPropertyTypes
    ...(accountId !== undefined && { queryKey: buildKey(accountId) }),
    enabled: accountId != null && extraEnabled,
  };
}
