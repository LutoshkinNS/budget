# syntax=docker/dockerfile:1.7

FROM node:23-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM base AS builder

WORKDIR /repo

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/api-contracts/package.json ./packages/api-contracts/
RUN --mount=type=cache,id=budget-pnpm,target=/pnpm/store,sharing=locked pnpm install --filter @budget/server... --frozen-lockfile

COPY packages/api-contracts/ ./packages/api-contracts/
COPY apps/server/ ./apps/server/

WORKDIR /repo/apps/server

ENV DATABASE_URL="file:/app/data/budget.db"

RUN pnpm exec prisma generate \
  && pnpm run build \
  && cp -r ./generated/prisma ./dist/generated/prisma

FROM base AS runner

WORKDIR /repo

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/api-contracts/package.json ./packages/api-contracts/
RUN --mount=type=cache,id=budget-pnpm,target=/pnpm/store,sharing=locked pnpm install --filter @budget/server --frozen-lockfile --prod

COPY --from=builder /repo/apps/server/dist/src /repo/apps/server/src
COPY --from=builder /repo/apps/server/dist/generated /repo/apps/server/generated
COPY --from=builder /repo/apps/server/generated/@typespec /repo/apps/server/generated/@typespec
COPY --from=builder /repo/apps/server/prisma /repo/apps/server/prisma

RUN mkdir -p /app/data

WORKDIR /repo/apps/server

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node src/main.js"]

EXPOSE 3000
