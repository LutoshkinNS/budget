# Frontend Architecture

Статус: черновик архитектурного соглашения для `apps/frontend`.

Фронтенд использует FEOD: Fractal Entity Oriental Design. Это не FSD. Документ описывает, как применять FEOD в текущем проекте, с учётом уже существующих `app`, `pages`, `modules` и `common`.

Источник идеи: https://habr.com/ru/companies/sportmaster_lab/articles/972410/

## Главный принцип

Frontend code is organized by responsibility and dependency direction:

```text
app
pages
modules
common
global
```

Код верхнего уровня может собирать нижние уровни, но нижние уровни не должны знать про верхние.

Главный инвариант для `modules`: внешний код импортирует модуль только через его public API, то есть через `index.ts`.

```ts
// ok
import { CategoriesList } from "@/modules/categories";

// not ok
import { CategoriesList } from "@/modules/categories/ui/categories-list.tsx";
```

## Слои

### `app`

`app` содержит инфраструктуру приложения:

- React entrypoint;
- providers;
- TanStack Router setup;
- route files;
- layouts;
- global styles/bootstrap.

Текущие директории:

```text
src/app/
  App.tsx
  main.tsx
  layouts/
  public/
  routes/
  styles/
```

Правила:

- `app` может импортировать `pages`, `modules`, `common`.
- Бизнес-логику сюда не кладём.
- `routeTree.gen.ts` generated; руками не редактировать.
- Route files должны быть тонкими: validate params/search, подключить layout/page, передать control дальше.

`app/routes` - это adapter files для TanStack Router, а не контейнеры бизнес-логики. Они владеют `createFileRoute`, `Route.useSearch`, `Route.useNavigate` и адаптером, который передаёт route data/actions в page.

Текущая оговорка: некоторые страницы импортируют свой `Route` из `app/routes` для `useSearch`/`useNavigate`. Это legacy exception для уже существующего кода. Новые страницы не должны импортировать из `app/routes`; route-specific parsing следует держать в route file или page-local route contract и передавать в page минимальный API.

### `pages`

`pages` содержат route-level composition.

Страница:

- собирает модули в экран;
- читает route params/search, если это проще и соответствует текущему route pattern;
- хранит локальное UI-состояние страницы;
- не содержит доменную бизнес-логику;
- не ходит напрямую в generated API, если для этого должен быть module hook.
- не импортирует `Route` или другие детали `app/routes`, кроме документированных legacy exceptions.

Пример структуры:

```text
src/pages/dashboard/
  dashboard.tsx
  dashboard.module.css
  index.ts
```

Страницы импортируются из route files:

```ts
import { Dashboard } from "@/pages/dashboard";
```

### `modules`

`modules` - основной слой доменных и feature capabilities. Модуль может быть entity-like, feature-like или composed capability. В этом проекте `accounts`, `categories`, `transactions`, `auth`, `user` - modules.

Базовая структура нового модуля:

```text
src/modules/<module>/
  index.ts
  model/
    types.ts
    schemas.ts
    use-something.ts
  ui/
    some-component.tsx
    some-component.module.css
  modules/
    README.md
```

Правила:

- `index.ts` - единственная public boundary модуля.
- `ui/` содержит React components и CSS modules.
- `model/` содержит hooks, types, schemas, adapters, module-local state.
- Generated API hooks из `common/api/generate` оборачиваем module hooks, если endpoint относится к домену модуля.
- Внешний код не импортирует `model/` или `ui/` другого модуля напрямую.
- Модуль может импортировать `common`.
- Модуль может импортировать public API другого модуля, если это отражает реальную dependency.
- Не создавать циклические зависимости между sibling modules.

Создание нового module boundary:

```bash
pnpm --filter @budget/frontend scaffold frontend-module <module-name> --title "<Title>"
```

Alias:

```bash
pnpm --filter @budget/frontend scaffold module <module-name>
```

### Nested modules

FEOD допускает фрактальность: `modules` могут быть вложены в `modules`.

Nested module является first-class FEOD module: у него те же границы, public API и правила зависимостей, что и у top-level module.

Используем nested modules, когда внутри большого модуля появляется самостоятельная capability, но она всё ещё принадлежит родительскому контексту.

Пример:

```text
src/modules/transactions/
  index.ts
  model/
  ui/
    period-summary/
    transaction-day/
  modules/
    user-filter/
      index.ts
      ui/
```

Правила для nested modules:

- У nested module тоже есть public API через `index.ts`.
- Nested module может содержать собственные `model/`, `ui/` и `modules/`.
- Родитель может импортировать child module через `./modules/<child>`.
- Другие modules не должны лезть во внутренности child module.
- Если child module начинает использоваться многими unrelated modules, поднять его выше в `src/modules/` или вынести в `common`, если в нём нет бизнес-смысла.

### Decomposition checklist

Для новой frontend-фичи или существенного расширения существующего модуля перед коммитом пройти checklist:

- `pages` содержит route-level composition и route/search state, но не доменную бизнес-логику.
- `modules/<module>/index.ts` экспортирует только intended public API.
- `model/` разделён по use-case, endpoint, adapter или типам, а не собирает всю логику в один catch-all файл.
- `ui/` разделён по видимым блокам экрана: controls, summary, list, item, details, sheet, form.
- Один `screen.tsx` не должен одновременно содержать controls, list, detail sheet, formatters, data adapters и navigation semantics; если это произошло, нужен split или короткое обоснование в PR/commit context.
- Если внутри модуля появляется самостоятельный workflow, list/detail/editor/filter/sheet или capability, рассмотреть nested module в `modules/<nested-module>/`.
- Route/search/navigation decisions остаются на уровне `app/routes` или `pages`; module UI сообщает события наружу через props/callbacks.
- Форматтеры, pure helpers и adapters выносятся из React components, когда начинают использоваться более чем в одном блоке или мешают читать UI.
- Перед финальной проверкой структура папок должна объяснять устройство фичи без чтения одного большого файла.

### `common`

`common` содержит общий код без привязки к конкретному домену:

```text
src/common/
  api/
  lib/
  ui/
```

Правила:

- `common` не является module boundary и не требует `index.ts`.
- Новый код в `common` может импортироваться напрямую из конкретного файла; barrel exports не обязательны.
- `common` не импортирует `app`, `pages` или `modules`.
- `common/api/generate` - generated Orval client. Не редактировать руками.
- `common/api/fetcher.ts`, `appQuery.ts`, `ApiError.ts` - инфраструктура API.
- `common/ui` - reusable UI primitives.
- Работа с SVG и иконками описана в [отдельном руководстве](frontend-icons.md).
- Состав и отображение основного меню принадлежат функциональному модулю `modules/navigation` с публичным API через `index.ts`. Layout подключает модуль через этот API; модуль не импортирует внутренности `app/routes` или страниц. Route/search-адаптеры остаются в `app/routes` и `pages`; `common/ui/navigation` содержит только переиспользуемый пункт меню.
- `common/lib` - reusable utilities.
- Не превращать `common` в свалку бизнес-логики. Если код знает про account/category/transaction, ему место в module.

### `global`

Отдельной директории `global` сейчас нет. Роль global выполняют:

```text
src/app/styles/
src/app/public/
```

Правила:

- Global CSS и static assets подключаются из app layer.
- Не импортировать global files из modules/pages напрямую, если это не established pattern проекта.

## Dependency Rules

Разрешённые направления:

```text
app -> pages -> modules -> common
app -> modules
app -> common
pages -> common
modules -> modules public API
modules -> nested modules public API
```

Запрещённые направления:

```text
common -> modules/pages/app
modules -> pages/app
pages -> internals of modules
modules -> internals of sibling modules
```

## API Data Flow

1. TypeSpec contract lives in `packages/api-contracts`.
2. Orval generates frontend client into `src/common/api/generate`.
3. Module hooks wrap generated hooks and expose domain-oriented API.
4. UI components use module hooks/components through module public API.
5. Pages compose modules and route state.

### Query keys and cross-module effects

Query-key structure is private to the owning module's `model/`. Consumers use its public query hooks and cache commands; each module maintains its own cache invariants. A page may compose a cross-module consequence through a semantic callback when it owns the scenario. The mutation invocation supplies immutable scope to that callback and awaits it when completion includes the consequence.

For example, `Categories` passes `onCategoryUpdated` to the public `CategoriesList` component. The category mutation carries its `accountId` in the request variables, invalidates its own cache with that scope, and awaits the callback; the page calls the public `invalidateTransactionsCategorySummary(accountId)` command exported by `transactions`. The page chooses the scenario-level connection while each module keeps its keys and cache logic private. Keep dependency direction consistent with [Dependency Rules](#dependency-rules).

### Account context

The JWT cookie identifies only the user. Every account-scoped request names its account in the path (`/api/v1/accounts/{accountId}/...`), and the server verifies access to it, so the meaning of a request cannot change mid-flight. The `user` module owns the selected account: it resolves the current account from the device-local selection (localStorage) validated against `me.accounts`, falling back to the first account. Switching accounts (`switchAccount`) is a local operation — no HTTP, no token reissue; it marks the previous account's cache subtree stale without a background refetch. Account-scoped query wrappers stay disabled until the current account is known; mutations capture the account into their variables at invocation time via `getCurrentAccountIdSnapshot()`/`requireCurrentAccountId()`.

Example:

```text
common/api/generate/categories/*
  -> modules/categories/model/use-create-category.ts
  -> modules/categories/index.ts
  -> pages/categories/categories.tsx
```

## Naming

- New file and folder names: kebab-case (`transaction-list.tsx`, `use-transactions.ts`, `period-summary/`).
- Component identifiers: PascalCase.
- Hook identifiers: `useSomething`; hook file names still use kebab-case (`use-something.ts`).
- Public exports live in `index.ts`.
- CSS modules live next to component and use the same kebab-case base name: `expense-list.module.css`.

### Test placement

Follow the application test-location rule in [AGENTS.md](../../../AGENTS.md#код-и-проверка): new and edited unit/component tests live in a local `tests/` directory, while E2E scenarios stay in `e2e/`. For example, `model/use-transactions.ts` is tested by `model/tests/use-transactions.test.ts`; `ui/category-editor.tsx` by `ui/tests/category-editor.test.tsx`. Existing tests move when edited, with their imports and other affected paths updated. Unchanged legacy tests stay in place until touched.

## React Rules

- Use `useEffect` only for code that must run because the component was displayed to the user.
- Do not use `useEffect` for deriving render data, synchronizing local state from props, or handling direct user actions when the logic can run in render, event handlers, or data/query hooks.

## Current Legacy Notes

Existing code may still have historical deviations (legacy exceptions):

- Existing PascalCase component filenames are legacy exceptions. For an edited handwritten camelCase file, apply the mandatory rename-on-edit rule in [AGENTS.md](../../../AGENTS.md#код-и-проверка). New files use kebab-case.
- Root module hooks outside `model/` are legacy exceptions. Keep any existing ones working until the module is touched, then prefer moving them into `model/`.
- Some pages read their own TanStack `Route` object from `app/routes`; new pages must use route adapters and page props/contracts instead.
- `transactions/modules/*` already uses nested modules and is valid FEOD-style structure.

Do not churn existing files only to move them. When touching a legacy module for real work, prefer moving new code toward:

```text
index.ts
model/
ui/
modules/
```

## Scaffolds

Create a page:

```bash
pnpm --filter @budget/frontend scaffold frontend-page <page-name> --private --title "<Title>"
```

Create a module:

```bash
pnpm --filter @budget/frontend scaffold frontend-module <module-name> [--title "<Title>"] [--dry-run] [--force]
```

Create a nested module:

```bash
pnpm --filter @budget/frontend scaffold frontend-module <module-name> --parent <module-path> [--title "<Title>"] [--dry-run] [--force]
```

`--parent` is a path relative to `src/modules`: `--parent transactions` creates the module in `src/modules/transactions/modules`, while `--parent transactions/modules/charts` creates it in `src/modules/transactions/modules/charts/modules`. Without `--force`, the scaffold refuses to overwrite existing files; `--dry-run` only previews the planned files.

Scaffolds intentionally generate only a boundary and simple placeholders. They should not generate domain behavior until the API contract and module responsibility are clear. `frontend-module` also creates `modules/README.md` as a local reminder for when to extract nested modules; delete it only when the module intentionally does not need nested capabilities.
