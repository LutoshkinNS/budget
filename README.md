# Budget

Budget is a personal expense and income tracking app. It is built as a pnpm monorepo with a Fastify API, SQLite database, TypeSpec API contracts, and a React frontend.

The app currently supports Telegram login, multiple accounts, account invitations, categories and subcategories, transactions, recent expenses, dashboard summaries, and category analytics for expenses and income.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TanStack Router, TanStack Query, Orval, Vitest, Playwright.
- **Backend:** Fastify, TypeScript, Prisma, SQLite, JSON Schema validation.
- **API contract:** TypeSpec generates OpenAPI; Orval generates the frontend client.
- **Package manager:** pnpm workspaces.
- **Production:** Docker Compose, GHCR images, nginx, Cloudflare, same-origin API.

## Repository Layout

```text
apps/
  frontend/              React + Vite app
  server/                Fastify + Prisma API
packages/
  api-contracts/         TypeSpec source and generated OpenAPI
docs/
  architecture.md        How the system is put together
  development.md         Local setup and daily workflow
prod.md                  Production runbook
```

Generated files are intentionally kept out of handwritten code. Do not edit these paths manually:

- `apps/frontend/src/common/api/generate/`
- `apps/frontend/src/app/routes/routeTree.gen.ts`
- `apps/server/generated/`
- `packages/api-contracts/generated/`

## Quick Start

Prerequisites:

- Node.js 20+
- pnpm 9+; the repo currently pins `pnpm@11.8.0`
- SQLite through Prisma; no separate local database server is needed

Install dependencies:

```bash
pnpm install
```

Create local env files. At minimum the server needs:

```text
PORT=3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=<local-secret>
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
TELEGRAM_BOT_TOKEN=<telegram-bot-token-or-dev-placeholder>
```

The frontend usually needs:

```text
VITE_API_URL=http://localhost:3000
VITE_TELEGRAM_BOT_NAME=<bot-name-without-at>
```

Prepare the database and generated code:

```bash
pnpm --filter @budget/server exec prisma migrate dev
pnpm --filter @budget/server prisma:generate
pnpm --filter @budget/server typespec
pnpm --filter @budget/frontend api:generate
```

Run the app:

```bash
pnpm run dev
```

Default local URLs:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api/v1`
- Prisma Studio: `http://localhost:5555`

## Common Commands

Run both apps:

```bash
pnpm run dev
```

Run one app:

```bash
pnpm run client
pnpm run server
```

Regenerate API artifacts after TypeSpec changes:

```bash
pnpm --filter @budget/api-contracts typespec:generate
pnpm --filter @budget/server typespec
pnpm --filter @budget/frontend api:generate
```

Validate server and frontend:

```bash
pnpm --filter @budget/server build
pnpm --filter @budget/frontend ts:check
pnpm --filter @budget/frontend lint
pnpm --filter @budget/frontend test
```

Run frontend E2E tests:

```bash
pnpm --filter @budget/frontend e2e:install
pnpm --filter @budget/frontend e2e
```

## Documentation

- [Development Guide](docs/development.md) explains local setup, env files, daily commands, TypeSpec, Prisma, testing, and troubleshooting.
- [Architecture Guide](docs/architecture.md) explains the monorepo, backend domains, frontend FEOD boundaries, generated API flow, data model, and production topology.
- [Frontend Architecture](apps/frontend/ARCHITECTURE.md) is the detailed FEOD convention for `apps/frontend`.
- [Production Runbook](prod.md) documents the deployed `budget-best.ru` environment and operational procedures.

## Development Notes

The project uses a contract-first API flow:

1. Edit TypeSpec in `packages/api-contracts/typespec/`.
2. Generate OpenAPI into `packages/api-contracts/generated/`.
3. Generate server JSON schemas into `apps/server/generated/`.
4. Generate frontend React Query client into `apps/frontend/src/common/api/generate/`.
5. Implement or update Fastify handlers in `apps/server/src/domains/`.
6. Wrap generated frontend hooks inside FEOD modules before using them in pages.

Frontend structure follows FEOD, not FSD. New UI work should keep route state in `app/routes` or `pages`, domain capabilities in `modules`, and shared infrastructure in `common`.

## Production

Production uses Docker Compose images published to GHCR and served behind host nginx and Cloudflare:

```text
https://budget-best.ru
  /api/* -> backend container on localhost:3000
  /*     -> frontend container on localhost:3001
```

Do not commit real secrets. Production env lives on the VPS in `/opt/budget/.env`; see [prod.md](prod.md) for deployment, rollback, SQLite backup, nginx, Cloudflare, and smoke-test procedures.
