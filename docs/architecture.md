# Architecture Guide

Budget is a pnpm monorepo with a contract-first API. The backend owns domain behavior and persistence, the TypeSpec package owns the HTTP contract, and the frontend consumes generated client hooks through FEOD modules.

## System Overview

```text
apps/frontend
  React app
  -> generated Orval client
  -> /api/v1/*

packages/api-contracts
  TypeSpec source
  -> generated OpenAPI

apps/server
  Fastify routes and domain handlers
  -> Prisma
  -> SQLite
```

Production adds Docker, nginx, Cloudflare, and same-origin routing:

```text
User
  -> Cloudflare
  -> host nginx :443
      /api/* -> localhost:3000 -> budget_server
      /*     -> localhost:3001 -> budget_frontend
```

## Packages

### `packages/api-contracts`

Source of truth for HTTP API shape.

Key paths:

- `typespec/main.tsp`
- `typespec/general.tsp`
- `typespec/domains/*.tsp`
- `generated/@typespec/openapi3/openapi.json`

The service is routed under `/api/v1` and currently exposes accounts, auth, categories, subcategories, transactions, transaction summaries, and category analytics.

### `apps/server`

Fastify API server.

Key paths:

- `src/main.ts` registers domain routes under `/api/v1/*`.
- `src/appInit.ts` wires env, CORS, cookies, Prisma, JWT, and the error handler.
- `src/domains/` contains domain route handlers and domain helpers.
- `src/plugins/` contains Fastify plugins for env, Prisma, JWT, and errors.
- `prisma/schema.prisma` defines the SQLite data model.
- `generated/` contains Prisma and TypeSpec-generated artifacts.

Backend path aliases:

- `#src/*` -> `./src/*`
- `#s/*` -> `./generated/@typespec/ts-schemas/*`
- `#generated/*` -> `./generated/*`

### `apps/frontend`

React + Vite app.

Key paths:

- `src/app/` for app bootstrap, providers, layouts, routes, and global styles.
- `src/pages/` for route-level composition.
- `src/modules/` for domain and feature capabilities.
- `src/common/` for API infrastructure, generated client, shared UI, and utilities.
- `src/common/api/generate/` for Orval-generated code.

The detailed frontend convention lives in [../apps/frontend/docs/frontend-architecture.md](../apps/frontend/docs/frontend-architecture.md).

## API Generation Flow

The project uses a contract-first flow:

```text
TypeSpec
  -> OpenAPI
  -> server JSON schemas
  -> frontend React Query client
  -> module hooks and UI
```

Commands:

```bash
pnpm --filter @budget/api-contracts typespec:generate
pnpm --filter @budget/server typespec
pnpm --filter @budget/frontend api:generate
```

Server handlers import generated schemas through `#s/*`. Frontend modules wrap generated Orval hooks so pages do not depend directly on generated API details.

## Backend Domains

Current server domains:

- `auth`: Telegram login, refresh/logout, current user, dev login outside production, account switching, client auth event logging.
- `accounts`: account list, account update, members, invitations, invitation redemption.
- `categories`: income and expense categories, normalized names, soft delete.
- `subcategories`: subcategories under transaction categories.
- `transactions`: unified income and expense transactions, summaries, category analytics, balance helpers.

The backend uses account-scoped data. Authenticated requests operate inside the current account from JWT context.

## Data Model

Core Prisma models:

- `User`: Telegram-backed user profile.
- `Account`: owned budget account with initial balance and shared members.
- `AccountUser`: membership relation between users and accounts.
- `AccountInvitation`: shareable invite code with expiry and usage fields.
- `TransactionCategory`: account-scoped category with `income` or `expense` type stored as text.
- `Subcategory`: optional category child.
- `Transaction`: income or expense with amount, date, user, account, and category.

SQLite is used locally and in production. The production database is a persistent file mounted into the server container.

## Frontend Architecture

Frontend follows FEOD: Fractal Entity Oriental Design. The practical dependency direction is:

```text
app -> pages -> modules -> common
```

Rules of thumb:

- `app/routes` owns TanStack Router route files and adapters.
- `pages` compose screens and route-level state.
- `modules` own feature/domain model hooks and UI blocks.
- `common` owns reusable infrastructure and UI primitives.
- Other code imports a module through its `index.ts`, not through internal `model/` or `ui/` files.
- Generated API hooks are wrapped by module hooks before use in screens.
- Nested modules are used for internal workflows like filters, sheets, summaries, and lists.

Important frontend pages today:

- `/` for quick transaction entry and recent expenses.
- `/dashboard` for account-level summary.
- `/reports` for income and expense category analytics.
- `/categories` for category management.
- `/settings` for accounts, invitations, members, and logout.
- `/invite/:code` for account invitation redemption.

## Auth and Accounts

Authentication is Telegram-based. The server validates Telegram auth payloads, issues JWT-backed cookies, and uses the current account in authenticated flows.

Accounts can be shared through invite codes. Users can switch the active account, which refreshes auth cookies with the selected account context.

## Styling and UI

The frontend uses CSS modules plus global semantic CSS variables. Recent UI work should prefer semantic tokens for surfaces, text, borders, muted states, overlays, success, and error colors instead of hardcoded light-theme colors.

## Generated and Ignored Artifacts

Generated artifacts:

- `packages/api-contracts/generated/`
- `apps/server/generated/`
- `apps/frontend/src/common/api/generate/`
- `apps/frontend/src/app/routes/routeTree.gen.ts`

Local-only artifacts:

- `.env*`
- `apps/server/prisma/*.db`
- `.codex/`
- `.claude/`
- `output/playwright/`
- draft docs under `docs/_drafts/`

## Production Architecture

The production system is documented in [../prod.md](../prod.md). The short version:

- Main site: `https://budget-best.ru`
- Frontend calls same-origin `/api/*`.
- `https://api.budget-best.ru` is legacy.
- GitHub Actions builds server and frontend Docker images and publishes them to GHCR.
- VPS checkout lives at `/opt/budget`.
- `deploy.sh` pulls images and recreates containers.
- nginx terminates host routing and proxies frontend/API traffic.
- SQLite data lives under `/opt/budget/apps/server/data/`.

Do not put production secrets or real `.env` contents into documentation or commits.
