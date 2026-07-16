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

The frontend follows Feature-Sliced Design conventions:

- `app/` - app initialization, providers, routing, TanStack Router setup.
- `pages/` - page-level screens.
- `entities/` - business entity hooks and model-facing logic.
- `features/` - feature-specific UI and interactions.
- `shared/` / `common/` - shared utilities, API setup, reusable UI, generated API client.

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
- Preserve Feature-Sliced Design boundaries in frontend changes.
- Keep backend changes inside the relevant domain/module unless a shared abstraction is justified.
- Prefer project-local helpers, aliases, and patterns over introducing new conventions.

## Repository Artifacts

Do not commit Codex/agent working artifacts. Keep these local unless the user explicitly asks otherwise:

- `docs/` working drafts and planning notes.
- `.codex/` task memory, reports, local config, temporary files.
- `.claude/` legacy task memory or Claude-specific files.
- `.playwright-mcp/`, `.mcp.json`, and similar local tool artifacts.

When committing, include only source, tests, configuration, generated artifacts that the project intentionally tracks, and documentation intended for the repository.
