# Budget Server

Fastify сервер с SQLite базой данных. Использует Prisma для работы с БД и TypeSpec для генерации API схем.

## Требования

- Node.js 20+
- npm
- Docker и Docker Compose (для production запуска)

## Первоначальная настройка

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Генерация Prisma клиента

Prisma клиент генерируется автоматически, но можно запустить вручную:

```bash
npx prisma generate
```

Это создаст TypeScript клиент в `generated/prisma/` на основе `prisma/schema.prisma`.

### 3. Применение миграций базы данных

Если база данных еще не создана или нужно применить миграции:

```bash
npx prisma migrate dev
```

Эта команда:
- Создаст базу данных SQLite (`prisma/dev.db`), если её нет
- Применит все миграции из `prisma/migrations/`
- Запустит seed (если настроен в `prisma.config.ts`)

### 4. Генерация TypeSpec схем

TypeSpec используется для описания API и генерации JSON схем:

```bash
npm run typespec
```

Эта команда:
- Компилирует TypeSpec файлы из `typespec/` в OpenAPI 3.1.0
- Генерирует TypeScript схемы в `generated/@typespec/ts-schemas/`

**Важно**: После изменения файлов в `typespec/` нужно запускать эту команду заново.

## Разработка (Development)

### Запуск сервера в режиме разработки

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000` с автоматической перезагрузкой при изменении файлов.

### Работа с TypeSpec

#### Генерация схем (один раз)

```bash
npm run typespec
```

#### Генерация схем в watch режиме (автоматически при изменениях)

```bash
npm run typespec:generate:watch
```

Это удобно при активной разработке API - схемы будут обновляться автоматически.

#### Структура TypeSpec

- `typespec/main.tsp` - главный файл, определяет все эндпоинты
- `typespec/domains/` - доменные модели (category, expense, subcategory, user)
- `typespec/general.tsp` - общие типы и утилиты

После генерации схемы доступны через импорты:
```typescript
import Category from "#s/Category.js";
```

### Работа с Prisma

#### Prisma Studio - визуальный редактор БД

```bash
npm run prisma:studio
```

Откроется веб-интерфейс на `http://localhost:5555` для просмотра и редактирования данных.

#### Создание новой миграции

Когда изменяешь `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name название_миграции
```

Например:
```bash
npx prisma migrate dev --name add_expense_table
```

Эта команда:
- Создаст новую миграцию в `prisma/migrations/`
- Применит её к базе данных
- Автоматически сгенерирует Prisma клиент

#### Просмотр статуса миграций

```bash
npx prisma migrate status
```

#### Откат миграции

```bash
npx prisma migrate resolve --rolled-back название_миграции
```

#### Генерация Prisma клиента (без миграций)

Если нужно только обновить клиент после изменения схемы:

```bash
npx prisma generate
```

#### Seed базы данных

Для заполнения БД начальными данными:

```bash
npx prisma db seed
```

Seed файл находится в `prisma/seed.ts`.

## Production запуск (Docker)

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
curl http://localhost:3000/categories
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
- **5555** - Prisma Studio (только в dev режиме)

## Переменные окружения

- `NODE_ENV=production` (в Docker)
- `DATABASE_PATH=/app/data/budget.db` (в Docker)

## Структура проекта

```
server/
├── src/                    # Исходный код сервера
│   └── index.ts           # Точка входа
├── prisma/                 # Prisma конфигурация
│   ├── schema.prisma      # Схема базы данных
│   ├── migrations/        # Миграции БД
│   ├── seed.ts           # Начальные данные
│   └── dev.db            # SQLite база (dev)
├── typespec/              # TypeSpec API описание
│   ├── main.tsp          # Главный файл API
│   ├── general.tsp       # Общие типы
│   └── domains/          # Доменные модели
├── generated/             # Сгенерированные файлы
│   ├── prisma/           # Prisma клиент
│   └── @typespec/        # TypeSpec схемы
└── data/                  # База данных (production)
    └── budget.db
```

## Типичный workflow разработки

1. **Изменил схему БД** (`prisma/schema.prisma`):
   ```bash
   npx prisma migrate dev --name описание_изменения
   ```

2. **Изменил API** (`typespec/`):
   ```bash
   npm run typespec
   # или в watch режиме:
   npm run typespec:generate:watch
   ```

3. **Обновил код сервера** (`src/`):
   - Сервер автоматически перезагрузится (если запущен `npm run dev`)

4. **Проверил данные в БД**:
   ```bash
   npm run prisma:studio
   ```

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

- **База данных (dev)**: `server/prisma/dev.db`
- **База данных (production)**: `server/data/budget.db`
- **Логи**: `docker logs fastify_app`
