# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for a budget/expense tracking application with a Fastify backend and React frontend. The project uses TypeSpec for API contract generation, with automatic client code generation via Orval.

## Repository Structure

- `frontend/` - React + TypeScript + Vite frontend application
- `server/` - Fastify + Prisma backend application
- `server/typespec/` - TypeSpec API specifications
- `server/prisma/` - Database schema and migrations

## Development Commands

### Frontend (run from `frontend/` directory)

```bash
npm run build            # Build for production (runs TypeScript check first)
npm run lint             # Run ESLint
npm run prettier:check   # Check code formatting
npm run prettier:write   # Format code with Prettier
npm run api:generate     # Generate API client from OpenAPI spec
```

### Server (run from `server/` directory)

```bash
npm run build                         # Build TypeScript to dist/
npm run typespec:generate             # Generate OpenAPI spec from TypeSpec
npm run typespec:generate:watch       # Generate OpenAPI spec in watch mode
npm run typespec:generateTsSchemas    # Generate TypeScript schemas from OpenAPI
npm run typespec                      # Run both typespec commands
npm run prisma:seed                   # Seed database with initial data
```

## API Contract Development Flow

The project uses a contract-first approach with TypeSpec:

1. **Define API contract**: Edit TypeSpec files in `server/typespec/` (main entry: `main.tsp`)
2. **Generate OpenAPI spec**: Run `npm run typespec:generate` in server directory
3. **Generate TypeScript schemas**: Run `npm run typespec:generateTsSchemas` in server directory
4. **Generate frontend client**: Run `npm run api:generate` in frontend directory
5. **Implement server handlers**: Create route handlers in `server/src/domains/`

The generated files are in `server/generated/@typespec/` (ignored by git).

## Architecture

### Backend Architecture

- **Framework**: Fastify with JSON Schema validation via Ajv
- **Database**: SQLite via Prisma ORM
- **Type Provider**: `@fastify/type-provider-json-schema-to-ts` for type-safe schemas
- **Module Structure**: Domain-based modules in `server/src/domains/` (categories, expenses, subcategories)
- **Schemas**: TypeSpec generates JSON schemas imported from `#s/*` alias (`generated/@typespec/ts-schemas/`)
- **Prisma Plugin**: Prisma client injected via plugin at `server/src/plugins/prisma/prismaPlugin.ts`

Server entry point: `server/src/main.ts` registers domain modules with route prefixes.

TypeScript path aliases (defined in `package.json` imports and `tsconfig.json`):
- `#src/*` → `./src/*`
- `#s/*` → `./generated/@typespec/ts-schemas/*`
- `#generated/*` → `./generated/*`

### Frontend Architecture

Uses Feature-Sliced Design (FSD) methodology with layers:

- **app/** - Application initialization, routing, and providers
  - Contains TanStack Router setup and route definitions
  - `App.tsx` wraps app with QueryClientProvider and RouterProvider

- **pages/** - Page components (e.g., Categories, Main)

- **entities/** - Business entities with hooks (e.g., categories, subcategories, expense)
  - Each entity has a custom hook that wraps generated API hooks
  - Hooks include Zod validation and error handling via notifications
  - Example: `useCategories()` wraps `useCategoriesList()` and validates with Zod and `useInvalidateCategories()`

- **features/** - Feature-specific components

- **shared/** - Shared utilities, UI components
  - Contains notification system (`shared/lib/notifications`)
  - Contains all reusable things without business logic

- **kernel/** - Core application logic
  - `kernel/api/` - API client configuration
    - `appQuery.ts` - TanStack Query client configuration
    - `customFetcher.ts` - Custom fetch wrapper for API calls
    - `generate/` - Auto-generated API client from Orval (DO NOT EDIT)

### API Client Generation

Orval configuration (`frontend/orval.config.ts`) generates two outputs:
- **React Query hooks** (`*.gen.ts`) - TanStack Query hooks for API calls
- **Zod schemas** (`*.zod.gen.ts`) - Runtime validation schemas

Generated client uses custom fetcher from `kernel/api/customFetcher.ts` that:
- Throws errors with `{code, message}` structure on non-OK responses
- Returns undefined for 204/205/304 status codes

### Data Flow Pattern

1. TypeSpec defines API contract in `server/typespec/`
2. Generated OpenAPI spec creates TypeScript schemas for server
3. Orval generates React Query hooks and Zod schemas for frontend
4. Entity hooks (`entities/*/`) wrap generated hooks with validation and error handling
5. Page components use entity hooks to display data

## Database

- **ORM**: Prisma with SQLite (`server/prisma/dev.db`)
- **Schema**: `server/prisma/schema.prisma`
- **Generated client**: Output to `server/generated/prisma/`

Key models: User, Account, AccountUser, Category, Subcategory, Expense

Soft deletes are used for Categories and Subcategories via `deletedAt` field.

## Code Style

- **React Compiler**: Enabled for automatic memoization
- **Import sorting**: Use `eslint-plugin-simple-import-sort`
- **Formatting**: Prettier is configured
- **TypeScript**: Strict mode enabled on both frontend and server

## Important Notes

- **Generated files**: Never edit files in `kernel/api/generate/`, `server/generated/`
- **Hard-coded account ID**: Server currently uses `accountId = 1` for all operations (TODO: add authentication)
- **Russian language**: Some UI text and comments are in Russian
- **FSD methodology**: Follow Feature-Sliced Design patterns when adding frontend code
- **Error handling**: Frontend entity hooks validate responses with Zod and show notifications on errors
