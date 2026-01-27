FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
RUN cp -r /app/generated/prisma /app/dist/generated/prisma

FROM node:23-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/src ./src
COPY --from=builder /app/dist/generated ./generated
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/data

CMD ["sh", "-c", "npx prisma migrate deploy && node src/main.js"]

EXPOSE 3000
