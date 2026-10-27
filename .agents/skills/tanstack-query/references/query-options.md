# Настройки запросов и границы абстракции

Прочитай этот раздел, когда проектируешь повторное использование `queryKey` и `queryFn`, параметры собственной query-функции, типы `select` или использование одного запроса в hooks и императивном коде. Примеры рассчитаны на TanStack Query v5. Фрагменты независимы; если не указано иначе, они используют общие `User` и типизированную `fetchUser` из базового примера.

```ts
type User = { id: string; displayName: string }
declare function fetchUser(id: string): Promise<User>
```

## Выбирай абстракцию по тому, что действительно переиспользуется

Сначала реши, что именно нужно обобщить: React-поведение между компонентами или конфигурацию одного запроса в нескольких местах.

- Hook может быть полезной простой обёрткой: он помещает общий `queryKey` и `queryFn` в одно место и отдаёт стандартный результат `useQuery`, знакомый всем потребителям.
- Трудность появляется по мере разнообразия потребителей. Сначала фиксированных `queryKey` и `queryFn` может хватать; затем разным экранам нужны разные `staleTime`, `select`, обработка ошибки или другие настройки. У обёртки появляется зеркальный API библиотеки: слишком узкий приходится расширять с каждым случаем, слишком широкий связывает вызывающий код с деталями `UseQueryOptions`.
- Стандартный результат сохраняет все возможности query API и часто подходит для общей hook-обёртки. Возврат только выбранных полей упрощает API, но может скрыть нужные потребителю состояния и действия.
- Hook доступен только в React-компоненте или другом hook и обычно жёстко выбирает `useQuery`. Конфигурацию могут использовать также `useSuspenseQuery`, `useQueries`, предварительная загрузка или route loader. Поэтому для общего описания запроса начни с обычной фабрики `queryOptions`; добавляй hook поверх неё только для дополнительной React-логики.

Это критерии выбора, а не запрет на собственные hooks. Оставь hook, если он явно уменьшает сложность потребителя или владеет поведением, которого нет в одной query-конфигурации.

## Почему широкий options-параметр портит inference

Не принимай голый `Partial<UseQueryOptions>` как универсальную точку настройки для конкретного запроса. У типа есть взаимосвязанные параметры: данные из `queryFn`, тип ошибки, данные результата `select` и тип ключа. При пропуске параметров TypeScript использует defaults библиотеки; тип исходных данных по умолчанию — `unknown`. После распространения таких настроек на `useQuery` потребитель теряет конкретный тип `data`.

```ts
import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

function useUser(
  id: string,
  options?: Partial<UseQueryOptions>,
) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => fetchUser(id),
    ...options,
  })
}

function useUserName(id: string) {
  const query = useUser(id)
  // @ts-expect-error У UseQueryOptions без generic-параметров data имеет тип unknown.
  return query.data.displayName
}
```

Указание только первого параметра сохраняет исходный тип данных, но по умолчанию тип `TData` результата совпадает с ним. Поэтому callback `select` должен вернуть `User`, хотя потребитель хочет строку:

```ts
import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

function useUser(
  id: string,
  options?: Partial<UseQueryOptions<User>>,
) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => fetchUser(id),
    ...options,
  })
}

function useSelectedUser(id: string) {
  return useUser(id, {
    // @ts-expect-error При одном generic-параметре select должен возвращать User.
    select: (user) => user.displayName,
  })
}
```

Можно вручную открыть и поддерживать все generic-параметры `UseQueryOptions`, включая отдельный тип выбранного результата, но такой wrapper приходится согласовывать с типами и вариантами API библиотеки. Это низкоуровневая абстракция, за которую вызывающий код платит сложностью типов. Сначала проверь, действительно ли нужна настраиваемая обёртка; простой запрос обычно лучше оставить прямо на вызове `useQuery`.

## Описывай общий запрос фабрикой `queryOptions`

Передавай в фабрику настоящие параметры, которые задают идентичность данных, например `id` или фильтр. Внутри помести связку `queryKey` и точно типизированной `queryFn`, а также лишь настройки, которые должны быть общими для всех потребителей (например, единый `staleTime`, если это часть политики этого запроса).

```ts
import { queryOptions } from '@tanstack/react-query'

function userQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['users', 'detail', id],
    queryFn: () => fetchUser(id),
  })
}
```

Следующие фрагменты используют `userQueryOptions` из этого примера. Перед их чтением достаточно знать базовые определения `User` и `fetchUser`, приведённые во вводном фрагменте.

В v5 `queryOptions` на runtime возвращает переданный объект; helper не является преобразованием запроса или механизмом runtime-проверки. Его основная польза — дать одному типизированному описанию запроса работать там, где оно нужно, сохраняя inference из `queryFn`. Он не гарантирует, что потребитель не переопределит `queryKey` или `queryFn`, и не проверяет совместимость override с ключом, функцией или данными кэша.

Сочетай общий минимум с настройками потребителя в месте вызова. `select` меняет форму данных наблюдателя, а не значение, записанное query-функцией в кэш; поэтому разные потребители могут проецировать один кэшированный `User` в разные результаты.

```tsx
import { useQuery } from '@tanstack/react-query'

function UserName({ id }: { id: string }) {
  const query = useQuery({
    ...userQueryOptions(id),
    staleTime: 60_000,
    throwOnError: true,
    select: (user) => user.displayName,
  })

  return <span>{query.data ?? 'Загрузка…'}</span>
}
```

Фабрика также не исключает собственные hooks. Используй их, если поверх запроса нужна React-логика, и возвращай стандартный результат, когда потребителям нужны обычные query-состояния:

```tsx
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

declare function reportQueryError(error: Error): void

function useUser(id: string) {
  const query = useQuery(userQueryOptions(id))

  useEffect(() => {
    if (query.isError) reportQueryError(query.error)
  }, [query.isError, query.error])

  return query
}
```

## Используй одно описание там, где оно нужно

Фабрику можно передать разным React API и императивному коду. Ни один из этих вызовов не требует создавать вторую версию ключа и функции загрузки:

```tsx
import {
  useQueries,
  useSuspenseQuery,
  type QueryClient,
} from '@tanstack/react-query'

const userId = 'user-42'

function UserPanel() {
  const query = useSuspenseQuery(userQueryOptions(userId))
  return <span>{query.data.displayName}</span>
}

function UsersPanel({ ids }: { ids: string[] }) {
  const queries = useQueries({
    queries: ids.map((id) => userQueryOptions(id)),
  })
  return <span>{queries.length} пользователей</span>
}

async function preloadUser(queryClient: QueryClient, id: string) {
  await queryClient.prefetchQuery(userQueryOptions(id))
}

async function loadUser(queryClient: QueryClient, id: string) {
  return queryClient.ensureQueryData(userQueryOptions(id))
}
```

`useSuspenseQuery` и `useQueries` остаются hooks, поэтому вызывай их в компонентах или других hooks с соблюдением правил React. `queryClient.prefetchQuery` можно вызвать из обработчика события или другого императивного кода; фабрика `queryOptions` сама hook не является. Route loader может так же переиспользовать описание с доступным ему `QueryClient`.

## Практический чеклист

1. Определи, нужно разделить React-поведение или только query-конфигурацию.
2. Оставь прямой вызов `useQuery`, если общей логики пока нет; вынеси общий key/fn через `queryOptions`, если тот же запрос нужен в нескольких местах.
3. Держи параметры данных в сигнатуре фабрики, а специфичные для наблюдателя настройки — рядом с `useQuery`.
4. Проверь inference исходных данных и результата `select`; убедись, что `select` не принимается за преобразование данных кэша.
5. Убедись, что overrides `queryKey`/`queryFn`, если они есть, намеренно согласованы между собой и с кэшем.
6. Используй custom hook поверх фабрики, когда он добавляет самостоятельное React-поведение.

Источники: [Creating Query Abstractions](https://tkdodo.eu/blog/creating-query-abstractions); официальные руководства [Query Options](https://tanstack.com/query/v5/docs/framework/react/guides/query-options), [TypeScript](https://tanstack.com/query/v5/docs/framework/react/typescript) и [Prefetching](https://tanstack.com/query/v5/docs/framework/react/guides/prefetching). Примеры используют API TanStack Query v5, установленного при подготовке справочника; страницы `/v5` могут перенаправить на latest, поэтому при применении сверь доступность API с версией проекта.
