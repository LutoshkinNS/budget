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

`modules` - основной слой доменных и feature capabilities. Модуль может быть entity-like, feature-like или composed capability. В этом проекте `accounts`, `categories`, `transactions`, `expenses`, `auth`, `user` - modules.

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
src/modules/expenses/
  index.ts
  model/
  ui/
  modules/
    period-summary/
      index.ts
      model/
      ui/
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

Example:

```text
common/api/generate/categories/*
  -> modules/categories/model/useCreateCategory.ts
  -> modules/categories/index.ts
  -> pages/categories/categories.tsx
```

## Naming

- New file and folder names: kebab-case (`expense-list.tsx`, `use-expenses.ts`, `period-summary/`).
- Component identifiers: PascalCase.
- Hook identifiers: `useSomething`; hook file names still use kebab-case (`use-something.ts`).
- Public exports live in `index.ts`.
- CSS modules live next to component and use the same kebab-case base name: `expense-list.module.css`.

## React Rules

- Use `useEffect` only for code that must run because the component was displayed to the user.
- Do not use `useEffect` for deriving render data, synchronizing local state from props, or handling direct user actions when the logic can run in render, event handlers, or data/query hooks.

## Current Legacy Notes

Existing code may still have historical deviations (legacy exceptions):

- Existing PascalCase component filenames and camelCase hook filenames may remain until touched. New files use kebab-case.
- Root module hooks outside `model/` are legacy exceptions. Keep any existing ones working until the module is touched, then prefer moving them into `model/`.
- Some pages read their own TanStack `Route` object from `app/routes`; new pages must use route adapters and page props/contracts instead.
- `expenses/modules/*` already uses nested modules and is valid FEOD-style structure.

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

`--parent` is a path relative to `src/modules`: `--parent expenses` creates the module in `src/modules/expenses/modules`, while `--parent expenses/modules/charts` creates it in `src/modules/expenses/modules/charts/modules`. Without `--force`, the scaffold refuses to overwrite existing files; `--dry-run` only previews the planned files.

Scaffolds intentionally generate only a boundary and simple placeholders. They should not generate domain behavior until the API contract and module responsibility are clear.
