# syntax=docker/dockerfile:1.7

FROM node:23-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM node:23-alpine AS openapi
WORKDIR /app
COPY packages/api-contracts/package.json ./
RUN npm install --ignore-scripts @typespec/openapi3@^1.5.0 @typespec/http@^1.5.0
COPY packages/api-contracts/tspconfig.yaml ./
COPY packages/api-contracts/typespec/ ./typespec/
RUN npx tsp compile ./typespec

FROM base AS builder

WORKDIR /repo

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/api-contracts/package.json ./packages/api-contracts/
RUN --mount=type=cache,id=budget-pnpm,target=/pnpm/store,sharing=locked pnpm install --filter @budget/frontend --frozen-lockfile

COPY --from=openapi /app/generated/@typespec/openapi3/openapi.json ./openapi.json
COPY apps/frontend/ ./apps/frontend/

WORKDIR /repo/apps/frontend

ARG VITE_API_URL
ARG VITE_TELEGRAM_BOT_NAME
RUN OPENAPI_PATH=/repo/openapi.json pnpm run build:prod

FROM nginxinc/nginx-unprivileged:alpine AS runner
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /repo/apps/frontend/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
