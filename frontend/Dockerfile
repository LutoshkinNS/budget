FROM node:23-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY server/generated/@typespec/openapi3/openapi.json ./openapi.json

COPY frontend/ .

RUN OPENAPI_PATH=./openapi.json npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runner

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
