# AGENTS.md

This file provides repository-specific guidance for Codex when working in this budget/expense tracking monorepo.

## Project Overview

This is a monorepo for a budget/expense tracking application with a Fastify backend and React frontend. The project uses TypeSpec for API contract generation and Orval for frontend API client generation.

## Repository Structure

- `apps/frontend/` - React + TypeScript + Vite frontend application.
- `apps/server/` - Fastify + Prisma backend application.
- `apps/server/prisma/` - Database schema and migrations.
- `packages/api-contracts/` - TypeSpec API contract package.
- `packages/api-contracts/typespec/` - TypeSpec source files.
- `packages/api-contracts/generated/` - TypeSpec-generated OpenAPI output.

## Development Commands

Run workspace commands from the repository root:

```bash
pnpm run dev      # Start frontend and server together
pnpm run client   # Start only @budget/frontend
pnpm run server   # Start only @budget/server
pnpm --filter @budget/frontend scaffold frontend-page <page-name> [--private|--public] [--title <title>]   # Create a frontend page and route
pnpm --filter @budget/frontend scaffold frontend-module <module-name> [--parent <module-path>] [--title <title>] [--dry-run] [--force]  # Create a frontend module boundary
```

Frontend commands:

```bash
pnpm --filter @budget/frontend dev
pnpm --filter @budget/frontend build:local
pnpm --filter @budget/frontend build:prod
pnpm --filter @budget/frontend ts:check
pnpm --filter @budget/frontend lint
pnpm --filter @budget/frontend lint:fix
pnpm --filter @budget/frontend test
pnpm --filter @budget/frontend prettier:check
pnpm --filter @budget/frontend prettier:write
pnpm --filter @budget/frontend api:generate
```

Server commands:

```bash
pnpm --filter @budget/server build
pnpm --filter @budget/server dev
pnpm --filter @budget/server lint
pnpm --filter @budget/server lint:fix
pnpm --filter @budget/server prettier:check
pnpm --filter @budget/server prettier:write
pnpm --filter @budget/server typespec:generate
pnpm --filter @budget/server typespec:generate:watch
pnpm --filter @budget/server typespec:generateTsSchemas
pnpm --filter @budget/server typespec
pnpm --filter @budget/server prisma:generate
pnpm --filter @budget/server prisma:seed
```

API contract package commands:

```bash
pnpm --filter @budget/api-contracts typespec:generate
pnpm --filter @budget/api-contracts typespec:generate:watch
```

## API Contract Development Flow

The project uses a contract-first approach with TypeSpec:

1. Edit TypeSpec files in `packages/api-contracts/typespec/` (entry point: `main.tsp`).
2. Generate OpenAPI output with `pnpm --filter @budget/api-contracts typespec:generate`.
3. Generate server TypeScript schemas with `pnpm --filter @budget/server typespec:generateTsSchemas`, or run both steps through `pnpm --filter @budget/server typespec`.
4. Generate the frontend client with `pnpm --filter @budget/frontend api:generate`.
5. Implement or update Fastify handlers in `apps/server/src/domains/`.

## Architecture

### Backend

- Framework: Fastify with JSON Schema validation via Ajv.
- Database: SQLite via Prisma ORM.
- Type provider: `@fastify/type-provider-json-schema-to-ts`.
- Module structure: domain modules under `apps/server/src/domains/`.
- Schemas: generated TypeSpec schemas are imported through the `#s/*` alias from `apps/server/generated/@typespec/ts-schemas/`.
- Prisma client: generated into `apps/server/generated/prisma/` and injected through `apps/server/src/plugins/prisma/prismaPlugin.ts`.
- Entry point: `apps/server/src/main.ts` registers domain modules and plugins.

Server TypeScript path aliases:

- `#src/*` -> `./src/*`
- `#s/*` -> `./generated/@typespec/ts-schemas/*`
- `#generated/*` -> `./generated/*`

### Frontend

The frontend follows FEOD (Fractal Entity Oriental Design), not FSD; the full convention is documented in `apps/frontend/ARCHITECTURE.md`:

- `app/` - app initialization, providers, routing, TanStack Router setup.
- `pages/` - page-level screens.
- `modules/` - feature/domain modules with a public API through `index.ts`.
- `common/` - shared utilities, API setup, reusable UI, generated API client.
- `app/routes/` - thin TanStack Router adapter files that bind routes to pages.

Frontend module rules:

- Create top-level modules with `pnpm --filter @budget/frontend scaffold frontend-module <module-name> [--title <title>] [--dry-run] [--force]`.
- Create nested modules with `pnpm --filter @budget/frontend scaffold frontend-module <module-name> --parent <module-path> [--title <title>] [--dry-run] [--force]`.
- `--parent` is relative to `src/modules`; for example, `--parent expenses` creates under `src/modules/expenses/modules`.
- `--dry-run` previews files and `--force` permits overwriting existing files.
- Expose module public API only from `src/modules/<module>/index.ts`.
- Nested modules are first-class FEOD modules and also expose their public API through `index.ts`.
- Keep UI components in `src/modules/<module>/ui/`.
- Keep module types, schemas and hooks in `src/modules/<module>/model/`, unless the existing module already uses a legacy root hook file.
- Root module hooks outside `model/` are legacy exceptions; migrate them when the module is otherwise touched.
- Do not import from another module's internal `model/` or `ui/` files; import from that module's `index.ts`.
- Do not place business logic in `pages/`; pages compose modules and route-level state.

Frontend decomposition checklist for new features or substantial module changes:

- Keep route/search/navigation state in `app/routes` or `pages`, not in `modules`.
- Split `ui/` by visible blocks such as controls, summary, list, item, details, sheet, and form instead of growing one large screen file.
- Split `model/` by use case, endpoint, adapter, schema, or type responsibility instead of growing one catch-all hook file.
- When a module contains an internal workflow, list/detail/editor/filter/sheet, consider a nested module under `modules/<module>/modules/<nested-module>/`.
- Before committing, verify the folder tree explains the feature shape without reading one large file.

Frontend React rules:

- Use `useEffect` only for code that must run because the component was displayed to the user. Do not use effects for deriving render data, synchronizing local state from props, or handling direct user actions when the logic can run in render, event handlers, or data/query hooks.

`common` is shared infrastructure, not a module boundary: it does not require `index.ts`, and new code may use direct imports from concrete files. Existing `pages -> app/routes` imports are legacy exceptions for TanStack Router coupling; new pages must not import route objects directly.

`app/routes` files are TanStack adapter files. They own `createFileRoute`, route hooks, and the adapter that passes route data/actions into a page; page composition and business logic belong in `pages` and `modules`.

Generated Orval client files live under `apps/frontend/src/common/api/generate/`. Do not edit generated files by hand.

## Generated Files

Do not manually edit generated artifacts:

- `apps/frontend/src/common/api/generate/`
- `apps/frontend/src/app/routes/routeTree.gen.ts`
- `apps/server/generated/`
- `packages/api-contracts/generated/`

Regenerate them through the documented commands instead.

## Database

- ORM: Prisma with SQLite.
- Schema: `apps/server/prisma/schema.prisma`.
- Generated client: `apps/server/generated/prisma/`.
- Key models include users, accounts, account membership/invitations, transaction categories, subcategories, and transactions.
- Category and subcategory deletes are modeled with `deletedAt`.

## Code Style

- Use the existing TypeScript strictness, ESLint, Prettier, and import sorting setup.
- Name new files and folders with kebab-case (`file-name.ts`, `feature-module/`) unless an external convention, generator, or framework requires another format.
- Avoid unsafe TypeScript type assertions (`value as Type`) in handwritten code. Prefer type guards, typed constants, discriminated unions, schemas, or narrower helper APIs. `as const` for literal inference is allowed and encouraged. If a non-const assertion is truly unavoidable, ask the user for explicit approval before adding it and document why.
- Keep related TypeScript types connected instead of widening them to abstract primitives. Prefer deriving unions, params, keys, and collections from the source type or tuple (`typeof SOME_VALUES[number]`, `Record<DomainType, ...>`, indexed access types) when entities represent the same domain concept.
- Preserve FEOD module boundaries and dependency directions in frontend changes.
- Keep backend changes inside the relevant domain/module unless a shared abstraction is justified.
- Prefer project-local helpers, aliases, and patterns over introducing new conventions.

## Repository Artifacts

Do not commit Codex/agent working artifacts. Keep these local unless the user explicitly asks otherwise:

- `docs/` working drafts and planning notes.
- `.codex/` task memory, reports, local config, temporary files.
- `.claude/` legacy task memory or Claude-specific files.
- `.playwright-mcp/`, `.mcp.json`, and similar local tool artifacts.

When committing, include only source, tests, configuration, generated artifacts that the project intentionally tracks, and documentation intended for the repository.
