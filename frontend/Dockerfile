FROM node:23-alpine AS openapi
WORKDIR /app
COPY server/package.json ./
RUN npm install --ignore-scripts @typespec/openapi3@^1.5.0 @typespec/http@^1.5.0
COPY server/tspconfig.yaml ./
COPY server/typespec/ ./typespec/
RUN npx tsp compile ./typespec

FROM node:23-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY --from=openapi /app/generated/@typespec/openapi3/openapi.json ./openapi.json
COPY frontend/ .
ARG VITE_API_URL
RUN OPENAPI_PATH=./openapi.json npm run build:prod

FROM nginxinc/nginx-unprivileged:alpine AS runner
COPY frontend/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
