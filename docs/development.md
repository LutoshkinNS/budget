# Development Guide

This guide is the "how do I run and change this again?" document for the Budget monorepo.

## Prerequisites

- Node.js 20+
- pnpm 9+; the repo pins `pnpm@11.8.0`
- Git
- Docker only for production-like runs, not for ordinary local development

Install dependencies from the repository root:

```bash
pnpm install
```

## Environment

Do not commit real `.env` files. They are ignored by git.

Server env, usually in `apps/server/.env`:

```text
PORT=3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=<local-secret>
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
TELEGRAM_BOT_TOKEN=<telegram-bot-token-or-dev-placeholder>
```

Frontend env, usually in `apps/frontend/.env.local`:

```text
VITE_API_URL=http://localhost:3000
VITE_TELEGRAM_BOT_NAME=<bot-name-without-at>
VITE_NGROK_DOMAIN=
```

In development, Vite proxies `/api` to `VITE_API_URL`. In production, `VITE_API_URL` is intentionally empty so the frontend calls the same-origin `/api/*` path.

## First Local Setup

From the repository root:

```bash
pnpm install
pnpm --filter @budget/server exec prisma migrate dev
pnpm --filter @budget/server prisma:generate
pnpm --filter @budget/server typespec
pnpm --filter @budget/frontend api:generate
```

Run everything:

```bash
pnpm run dev
```

Run only one side:

```bash
pnpm run client
pnpm run server
```

Useful local URLs:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api/v1`
- Prisma Studio: `http://localhost:5555`

## Daily Workflow

### Frontend

```bash
pnpm --filter @budget/frontend dev
pnpm --filter @budget/frontend ts:check
pnpm --filter @budget/frontend lint
pnpm --filter @budget/frontend test
pnpm --filter @budget/frontend build:local
```

### Server

```bash
pnpm --filter @budget/server dev
pnpm --filter @budget/server build
pnpm --filter @budget/server lint
pnpm --filter @budget/server prisma:studio
```

### TypeSpec and API Generation

The API contract lives in `packages/api-contracts/typespec/`.

After changing TypeSpec, regenerate in this order:

```bash
pnpm --filter @budget/api-contracts typespec:generate
pnpm --filter @budget/server typespec
pnpm --filter @budget/frontend api:generate
```

What these commands produce:

- `packages/api-contracts/generated/@typespec/openapi3/openapi.json`
- `apps/server/generated/@typespec/ts-schemas/`
- `apps/frontend/src/common/api/generate/`

Do not edit generated files by hand.

## Database and Prisma

The app uses SQLite through Prisma.

Main files:

- `apps/server/prisma/schema.prisma`
- `apps/server/prisma/migrations/`
- `apps/server/prisma/seed.ts`
- `apps/server/generated/prisma/`

Common commands:

```bash
pnpm --filter @budget/server exec prisma migrate dev
pnpm --filter @budget/server exec prisma migrate dev --name add_some_feature
pnpm --filter @budget/server exec prisma migrate status
pnpm --filter @budget/server prisma:generate
pnpm --filter @budget/server prisma:seed
pnpm --filter @budget/server prisma:studio
```

Local dev database files under `apps/server/prisma/*.db` are ignored by git.

## Frontend Scaffolding

The frontend has a small scaffold CLI for FEOD pages and modules.

Create a private page:

```bash
pnpm --filter @budget/frontend scaffold frontend-page reports --private --title "Reports"
```

Create a top-level module:

```bash
pnpm --filter @budget/frontend scaffold frontend-module reports --title "Reports"
```

Create a nested module:

```bash
pnpm --filter @budget/frontend scaffold frontend-module period-summary --parent expenses --title "Period Summary"
```

Use `--dry-run` before writing files and `--force` only when overwriting is intentional.

## Testing and Quality Gates

Recommended checks before committing a typical full-stack change:

```bash
pnpm --filter @budget/server build
pnpm --filter @budget/frontend ts:check
pnpm --filter @budget/frontend lint
pnpm --filter @budget/frontend test
```

For frontend browser flows:

```bash
pnpm --filter @budget/frontend e2e:install
pnpm --filter @budget/frontend e2e
pnpm --filter @budget/frontend e2e:headed
pnpm --filter @budget/frontend e2e:ui
```

Playwright artifacts are written under `output/playwright/frontend/` and are ignored by git.

## Production-Like Docker

Root `docker-compose.yml` builds or runs two services:

- `budget_server`, host port `3000`, container port `3000`
- `budget_frontend`, host port `3001`, container port `8080`

Example:

```bash
docker compose --env-file .env up -d --build
docker compose --env-file .env ps
docker compose --env-file .env logs
```

For real production procedures, use [../prod.md](../prod.md).

## Troubleshooting

If frontend API calls fail locally, check:

- `apps/frontend/.env.local` has `VITE_API_URL=http://localhost:3000`.
- The server is running on port `3000`.
- Server `FRONTEND_URL` matches `http://localhost:3001`.

If generated frontend hooks are missing, run:

```bash
pnpm --filter @budget/server typespec
pnpm --filter @budget/frontend api:generate
```

If Prisma types or client imports fail, run:

```bash
pnpm --filter @budget/server prisma:generate
```

If the database schema changed but local data is stale, inspect migrations with:

```bash
pnpm --filter @budget/server exec prisma migrate status
```
