# Budget Server

Fastify сервер с SQLite базой данных в Docker.

## Требования

- Docker
- Docker Compose

## Запуск

### 1. Перейти в папку server

```bash
cd server
```

### 2. Запустить сервис

```bash
docker-compose -f docker-compose.prod.yml up --build
```

### 3. Запуск в фоновом режиме

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Остановка

### Остановить сервис

```bash
docker-compose -f docker-compose.prod.yml down
```

### Остановить и удалить данные SQLite

```bash
# Остановить контейнер
docker-compose -f docker-compose.prod.yml down

# Удалить файл базы данных (опционально)
rm server/data/budget.db
```

## Проверка работы

### 1. Проверить статус контейнера

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 2. Проверить API сервера

```bash
curl http://localhost:3000/ping
# Ответ: pong
```

### 3. Проверить базу данных

```bash
# Подключиться к контейнеру
docker exec -it fastify_app sh

# В контейнере выполнить:
sqlite3 /app/data/budget.db
.tables
.quit
exit

# Или напрямую на хосте (файл базы в папке server/data/):
sqlite3 server/data/budget.db
.tables
.quit
```

### 4. Посмотреть логи

```bash
# Логи сервиса
docker-compose -f docker-compose.prod.yml logs

# Логи приложения
docker logs fastify_app
```

## Порты

- **3000** - Fastify сервер

## Переменные окружения

- `NODE_ENV=production`
- `DATABASE_PATH=/app/data/budget.db`

## Структура

- `fastify_app` - контейнер с Fastify сервером и SQLite
- `server/data/` - папка с файлом базы данных на хосте

## Преимущества SQLite

- ✅ Не требует отдельного контейнера для БД
- ✅ Простая настройка
- ✅ Файловая база данных
- ✅ Автоматическое создание БД при первом запуске

## Бэкап базы данных

### Создание бэкапа

```bash
# Скопировать файл базы
cp server/data/budget.db server/data/budget_backup_$(date +%Y%m%d_%H%M%S).db

# Или через Docker
docker cp fastify_app:/app/data/budget.db ./backup_budget.db
```

### Восстановление из бэкапа

```bash
# Остановить контейнер
docker-compose -f docker-compose.prod.yml down

# Заменить файл базы
cp server/data/budget_backup_20241008_210300.db server/data/budget.db

# Запустить контейнер
docker-compose -f docker-compose.prod.yml up -d
```

## Расположение файлов

- **База данных**: `server/data/budget.db`
- **Логи**: `docker logs fastify_app`
