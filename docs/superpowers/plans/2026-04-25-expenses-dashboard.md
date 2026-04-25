# Expenses Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать страницу `/dashboard` с большой суммой за период, фильтром по категории и списком трат, переиспользующим существующий `ExpensesByDays`.

**Architecture:** Новая страница-оркестратор (`pages/dashboard`) держит UI-состояние (`period`, `categoryId`) и компонует три виджета: `PeriodSummary` (новый подмодуль), `CategoryFilter` (новый подмодуль) и расширенный `ExpensesByDays`. Хук `useExpenses(days)` параметризуется, фильтр по категории — клиентский. Серверный API не меняем.

**Tech Stack:** React 19, TanStack Router (file routes), TanStack Query, CSS Modules, TypeScript strict, fractal module architecture.

**Spec:** `docs/superpowers/specs/2026-04-25-expenses-dashboard-design.md`

**Conventions:**
- Пакетный менеджер: `pnpm` (workspace).
- Префикс коммитов: `client:` (правило проекта).
- TS check: `cd apps/frontend && pnpm ts:check`
- Lint: `cd apps/frontend && pnpm lint`
- Dev server: `pnpm dev` из корня (поднимает frontend + server вместе).
- В проекте нет unit-тестов, поэтому TDD-цикл подменяется на: написать код → `ts:check` → `lint` → коммит. Финальная UI-проверка через Playwright делается отдельным таском в конце.

---

### Task 1: Расширение CSS-палитры

**Files:**
- Modify: `apps/frontend/src/app/styles/global.css`

- [ ] **Step 1: Дополнить переменные в light и dark медиа-запросах**

Открой `apps/frontend/src/app/styles/global.css` и **полностью замени** оба `@media (prefers-color-scheme: ...)` блока на следующее (существующие переменные сохраняются, добавляются новые):

```css
@media (prefers-color-scheme: light) {
    :root {
        --primary-color: #FDFDFD;
        --primary-text-color: #242229;
        --secondary-color: #333334;
        --secondary-text-color: #F3F3F3;

        --accent-color: #4F46E5;
        --accent-text-color: #FFFFFF;
        --muted-text-color: #8A8A90;
        --surface-color: #FFFFFF;
        --divider-color: #E8E8EA;

        color: #242229;
        background-color: #F4F4F4;
    }
}

@media (prefers-color-scheme: dark) {
    :root {
        --primary-color: #4e4e4e;
        --secondary-color: #bfbfbf;

        --primary-text-color: #F3F3F3;
        --secondary-text-color: #242229;
        --accent-color: #818CF8;
        --accent-text-color: #1A1A1F;
        --muted-text-color: #B0B0B5;
        --surface-color: #3A3A3A;
        --divider-color: #5A5A5A;
    }
}
```

- [ ] **Step 2: Запустить ts:check (smoke check, что CSS не сломал импорты)**

```bash
cd apps/frontend && pnpm ts:check
```

Expected: процесс завершается без ошибок (код выхода 0).

- [ ] **Step 3: Коммит**

```bash
git add apps/frontend/src/app/styles/global.css
git commit -m "client: расширена палитра для дашборда"
```

---

### Task 2: Параметризация `useExpenses(days?)`

**Files:**
- Modify: `apps/frontend/src/modules/expenses/useExpenses.ts`

- [ ] **Step 1: Принять параметр `days` с дефолтом**

В `apps/frontend/src/modules/expenses/useExpenses.ts` найди строку `const DAYS_TO_SHOW = 2;` и блок `export function useExpenses() { ... useExpensesList({ days: DAYS_TO_SHOW }) ... }`.

Замени их на:

```ts
const DEFAULT_DAYS = 2;

export function useExpenses(days: number = DEFAULT_DAYS) {
  const { data, isError, error, isLoading } = useExpensesList({ days });
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isError) {
      addNotification({
        id: "useExpenseError",
        title: error?.code || "Error",
        message: error?.message,
      });
      return;
    }

    if (data) {
      const validation = ExpensesListResponse.safeParse(data);
      if (!validation.success) {
        addNotification({
          id: "useExpenseValidation",
          title: "Некорректные данные",
          message: "повторите запрос позднее",
        });
      }
    }
  }, [isError, error, data, addNotification]);

  const validation = ExpensesListResponse.safeParse(data);
  const groups = validation.success && data ? groupByDay(data) : [];

  return { groups, isLoading };
}
```

Все остальное в файле (импорты, `groupByDay`, `getDayLabel`, `toIsoDate`, `useInvalidateExpensesList`, `ExpenseDayGroup` тип) — оставь без изменений.

- [ ] **Step 2: Запустить ts:check**

```bash
cd apps/frontend && pnpm ts:check
```

Expected: процесс завершается без ошибок. Существующий вызов `useExpenses()` без аргумента в `ExpensesByDays.tsx` остаётся валидным — параметр опциональный с дефолтом.

- [ ] **Step 3: Запустить lint**

```bash
cd apps/frontend && pnpm lint
```

Expected: 0 ошибок, 0 ворнингов.

- [ ] **Step 4: Коммит**

```bash
git add apps/frontend/src/modules/expenses/useExpenses.ts
git commit -m "client: useExpenses принимает параметр days"
```

---

### Task 3: Создание `EmptyState` для `ExpensesByDays`

**Files:**
- Create: `apps/frontend/src/modules/expenses/ui/ExpensesByDays/EmptyState.tsx`
- Modify: `apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.module.css`

- [ ] **Step 1: Создать `EmptyState.tsx`**

Создай файл `apps/frontend/src/modules/expenses/ui/ExpensesByDays/EmptyState.tsx`:

```tsx
import s from "./ExpensesByDays.module.css";

type EmptyStateProps = {
  variant: "empty" | "no-match";
  onReset?: () => void;
};

export function EmptyState({ variant, onReset }: EmptyStateProps) {
  if (variant === "empty") {
    return <div className={s.emptyState}>Нет трат за период</div>;
  }

  return (
    <div className={s.emptyState}>
      <p className={s.emptyStateText}>В этой категории трат за период нет</p>
      {onReset && (
        <button type="button" className={s.resetLink} onClick={onReset}>
          показать все
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Дополнить CSS-модуль**

Открой `apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.module.css` и **добавь** в конец файла (существующий `.container` сохраняется):

```css
.emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 16px;
    color: var(--muted-text-color);
    font-size: 14px;
    text-align: center;
}

.emptyStateText {
    margin: 0;
}

.resetLink {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent-color);
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
}
```

- [ ] **Step 3: ts:check + lint**

```bash
cd apps/frontend && pnpm ts:check && pnpm lint
```

Expected: 0 ошибок. Файл пока никем не импортируется — это нормально, в следующем таске он подключится.

- [ ] **Step 4: Коммит**

```bash
git add apps/frontend/src/modules/expenses/ui/ExpensesByDays/EmptyState.tsx \
        apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.module.css
git commit -m "client: добавлен EmptyState для ExpensesByDays"
```

---

### Task 4: Расширение `ExpensesByDays` пропсами и фильтрацией

**Files:**
- Modify: `apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.tsx`

- [ ] **Step 1: Полностью заменить содержимое файла**

Замени содержимое `apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.tsx` на:

```tsx
import { useMemo } from "react";

import { Loader } from "@/common/ui/loader/Loader.tsx";

import { ExpenseDayGroup } from "../../modules/expense-day";
import { useExpenses } from "../../useExpenses.ts";

import { EmptyState } from "./EmptyState.tsx";
import s from "./ExpensesByDays.module.css";

type ExpensesByDaysProps = {
  days?: number;
  categoryId?: number | null;
  onResetCategory?: () => void;
};

export function ExpensesByDays({
  days,
  categoryId = null,
  onResetCategory,
}: ExpensesByDaysProps = {}) {
  const { groups, isLoading } = useExpenses(days);

  const filtered = useMemo(() => {
    if (categoryId == null) return groups;
    return groups
      .map((g) => {
        const expenses = g.expenses.filter((e) => e.categoryId === categoryId);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        return { ...g, expenses, total };
      })
      .filter((g) => g.expenses.length > 0);
  }, [groups, categoryId]);

  if (isLoading) return <Loader />;

  if (filtered.length === 0) {
    return (
      <EmptyState
        variant={categoryId == null ? "empty" : "no-match"}
        onReset={categoryId == null ? undefined : onResetCategory}
      />
    );
  }

  return (
    <div className={s.container}>
      {filtered.map((group) => (
        <ExpenseDayGroup
          key={group.isoDate}
          label={group.label}
          total={group.total}
          expenses={group.expenses}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: ts:check + lint**

```bash
cd apps/frontend && pnpm ts:check && pnpm lint
```

Expected: 0 ошибок. Существующий вызов `<ExpensesByDays />` в `pages/main/Main.tsx` остаётся валидным — все пропсы опциональны.

- [ ] **Step 3: Коммит**

```bash
git add apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.tsx
git commit -m "client: ExpensesByDays принимает days и categoryId"
```

---

### Task 5: Подмодуль `period-summary`

**Files:**
- Create: `apps/frontend/src/modules/expenses/modules/period-summary/index.ts`
- Create: `apps/frontend/src/modules/expenses/modules/period-summary/model/types.ts`
- Create: `apps/frontend/src/modules/expenses/modules/period-summary/ui/PeriodSummary.tsx`
- Create: `apps/frontend/src/modules/expenses/modules/period-summary/ui/PeriodSummary.module.css`

- [ ] **Step 1: Создать `model/types.ts`**

```ts
export type Period = "day" | "week" | "month";

export const PERIOD_DAYS: Record<Period, number> = {
  day: 1,
  week: 7,
  month: 30,
};

export const periodToDays = (p: Period): number => PERIOD_DAYS[p];
```

Путь: `apps/frontend/src/modules/expenses/modules/period-summary/model/types.ts`

- [ ] **Step 2: Создать `ui/PeriodSummary.module.css`**

Путь: `apps/frontend/src/modules/expenses/modules/period-summary/ui/PeriodSummary.module.css`

```css
.summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.switcher {
    display: flex;
    flex-direction: row;
    gap: 4px;
    padding: 4px;
    background-color: var(--primary-color);
    border-radius: 12px;
}

.switchBtn {
    background: none;
    border: none;
    padding: 6px 14px;
    font-size: 12px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--primary-text-color);
    transition: background-color 0.15s ease, color 0.15s ease;
}

.switchBtnActive {
    background-color: var(--secondary-color);
    color: var(--secondary-text-color);
}

.amount {
    font-size: 32px;
    font-weight: 500;
    color: var(--primary-text-color);
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

- [ ] **Step 3: Создать `ui/PeriodSummary.tsx`**

Путь: `apps/frontend/src/modules/expenses/modules/period-summary/ui/PeriodSummary.tsx`

```tsx
import { useMemo } from "react";
import clsx from "clsx";

import { Loader } from "@/common/ui/loader/Loader.tsx";

import { useExpenses } from "../../../useExpenses.ts";
import type { Period } from "../model/types.ts";

import s from "./PeriodSummary.module.css";

type PeriodSummaryProps = {
  days: number;
  categoryId: number | null;
  period: Period;
  onPeriodChange: (p: Period) => void;
};

const PERIOD_LABELS: Record<Period, string> = {
  day: "день",
  week: "неделя",
  month: "месяц",
};

const PERIODS: Period[] = ["day", "week", "month"];

export function PeriodSummary({
  days,
  categoryId,
  period,
  onPeriodChange,
}: PeriodSummaryProps) {
  const { groups, isLoading } = useExpenses(days);

  const total = useMemo(() => {
    return groups
      .flatMap((g) => g.expenses)
      .filter((e) => categoryId == null || e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [groups, categoryId]);

  return (
    <div className={s.summary}>
      <div className={s.switcher} role="tablist">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={p === period}
            className={clsx(s.switchBtn, p === period && s.switchBtnActive)}
            onClick={() => onPeriodChange(p)}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
      <div className={s.amount}>
        {isLoading ? <Loader /> : `${total.toLocaleString("ru")} ₽`}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Создать `index.ts` (public API)**

Путь: `apps/frontend/src/modules/expenses/modules/period-summary/index.ts`

```ts
export { PeriodSummary } from "./ui/PeriodSummary.tsx";
export { type Period, PERIOD_DAYS, periodToDays } from "./model/types.ts";
```

- [ ] **Step 5: ts:check + lint**

```bash
cd apps/frontend && pnpm ts:check && pnpm lint
```

Expected: 0 ошибок. Подмодуль ещё нигде не импортируется — это нормально, он подключится в Task 7.

- [ ] **Step 6: Коммит**

```bash
git add apps/frontend/src/modules/expenses/modules/period-summary
git commit -m "client: подмодуль period-summary"
```

---

### Task 6: Подмодуль `category-filter`

**Files:**
- Create: `apps/frontend/src/modules/expenses/modules/category-filter/index.ts`
- Create: `apps/frontend/src/modules/expenses/modules/category-filter/ui/CategoryFilter.tsx`
- Create: `apps/frontend/src/modules/expenses/modules/category-filter/ui/CategoryFilter.module.css`

- [ ] **Step 1: Создать `ui/CategoryFilter.module.css`**

Путь: `apps/frontend/src/modules/expenses/modules/category-filter/ui/CategoryFilter.module.css`

```css
.chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
}

.chip {
    background: var(--surface-color);
    color: var(--primary-text-color);
    border: none;
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.chipActive {
    background-color: var(--accent-color);
    color: var(--accent-text-color);
}
```

- [ ] **Step 2: Создать `ui/CategoryFilter.tsx`**

Путь: `apps/frontend/src/modules/expenses/modules/category-filter/ui/CategoryFilter.tsx`

```tsx
import clsx from "clsx";

import { useCategories } from "@/modules/categories";

import s from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  value: number | null;
  onChange: (id: number | null) => void;
};

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories } = useCategories();

  return (
    <div className={s.chips} role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={value === null}
        className={clsx(s.chip, value === null && s.chipActive)}
        onClick={() => onChange(null)}
      >
        все
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={value === c.id}
          className={clsx(s.chip, value === c.id && s.chipActive)}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Создать `index.ts` (public API)**

Путь: `apps/frontend/src/modules/expenses/modules/category-filter/index.ts`

```ts
export { CategoryFilter } from "./ui/CategoryFilter.tsx";
```

- [ ] **Step 4: ts:check + lint**

```bash
cd apps/frontend && pnpm ts:check && pnpm lint
```

Expected: 0 ошибок.

- [ ] **Step 5: Коммит**

```bash
git add apps/frontend/src/modules/expenses/modules/category-filter
git commit -m "client: подмодуль category-filter"
```

---

### Task 7: Страница `Dashboard`

**Files:**
- Create: `apps/frontend/src/pages/dashboard/index.ts`
- Create: `apps/frontend/src/pages/dashboard/Dashboard.tsx`
- Create: `apps/frontend/src/pages/dashboard/Dashboard.module.css`

- [ ] **Step 1: Создать `Dashboard.module.css`**

Путь: `apps/frontend/src/pages/dashboard/Dashboard.module.css`

```css
.container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.title {
    font-size: 24px;
    font-weight: 400;
    line-height: 28px;
    letter-spacing: -0.03em;
    margin: 0;
}
```

- [ ] **Step 2: Создать `Dashboard.tsx`**

Путь: `apps/frontend/src/pages/dashboard/Dashboard.tsx`

```tsx
import { useState } from "react";

import { CategoryFilter } from "@/modules/expenses/modules/category-filter";
import {
  type Period,
  PeriodSummary,
  periodToDays,
} from "@/modules/expenses/modules/period-summary";
import { ExpensesByDays } from "@/modules/expenses";

import s from "./Dashboard.module.css";

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const days = periodToDays(period);

  return (
    <div className={s.container}>
      <h1 className={s.title}>Дашборд</h1>
      <PeriodSummary
        days={days}
        categoryId={categoryId}
        period={period}
        onPeriodChange={setPeriod}
      />
      <CategoryFilter value={categoryId} onChange={setCategoryId} />
      <ExpensesByDays
        days={days}
        categoryId={categoryId}
        onResetCategory={() => setCategoryId(null)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Создать `index.ts`**

Путь: `apps/frontend/src/pages/dashboard/index.ts`

```ts
export { Dashboard } from "./Dashboard.tsx";
```

- [ ] **Step 4: ts:check + lint**

```bash
cd apps/frontend && pnpm ts:check && pnpm lint
```

Expected: 0 ошибок. Страница ещё не имеет маршрута — это нормально, он добавится в Task 8.

- [ ] **Step 5: Коммит**

```bash
git add apps/frontend/src/pages/dashboard
git commit -m "client: страница Dashboard"
```

---

### Task 8: Регистрация маршрута `/dashboard`

**Files:**
- Create: `apps/frontend/src/app/routes/_private/dashboard.tsx`
- Auto-modify: `apps/frontend/src/app/routes/routeTree.gen.ts` (генерируется TanStack Router plugin при `dev`/`build`)

- [ ] **Step 1: Создать файл маршрута**

Путь: `apps/frontend/src/app/routes/_private/dashboard.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/pages/dashboard";

export const Route = createFileRoute("/_private/dashboard")({
  component: Dashboard,
});
```

- [ ] **Step 2: Перегенерировать route tree (через сборку)**

```bash
cd apps/frontend && pnpm ts:check
```

Expected: процесс завершается без ошибок. Если `ts:check` ругается, что `routeTree.gen.ts` не содержит запись для `/dashboard`, **запусти один раз** dev-сборку (Vite-плагин TanStack Router сгенерирует записи автоматически):

```bash
cd apps/frontend && pnpm dev
```

Дождись строки в выводе вроде `✓ X modules transformed`, затем останови процесс (Ctrl+C). После этого `apps/frontend/src/app/routes/routeTree.gen.ts` должен содержать ссылки на `_private/dashboard`. Перезапусти `ts:check`, чтобы убедиться:

```bash
cd apps/frontend && pnpm ts:check
```

Expected: 0 ошибок.

- [ ] **Step 3: Lint**

```bash
cd apps/frontend && pnpm lint
```

Expected: 0 ошибок.

- [ ] **Step 4: Коммит** (включи и сгенерированный `routeTree.gen.ts`)

```bash
git add apps/frontend/src/app/routes/_private/dashboard.tsx \
        apps/frontend/src/app/routes/routeTree.gen.ts
git commit -m "client: маршрут /dashboard"
```

---

### Task 9: Пункт «Дашборд» в навигации

**Files:**
- Modify: `apps/frontend/src/common/ui/navigation/Navigation.tsx`

- [ ] **Step 1: Добавить пункт между «Расходы» и «Категории»**

Открой `apps/frontend/src/common/ui/navigation/Navigation.tsx` и **полностью замени** компонент `Navigation` на:

```tsx
import { Link } from "@tanstack/react-router";

import s from "./navigation.module.css";

export function Navigation() {
  return (
    <nav className={s.navigationContainer}>
      <ul className={s.navList}>
        <li className={s.navItem}>
          <Link to="/">Расходы</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/dashboard">Дашборд</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/categories">Категории</Link>
        </li>
        <li className={s.navItem}>
          <Link to="/settings">Настройки</Link>
        </li>
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: ts:check + lint**

```bash
cd apps/frontend && pnpm ts:check && pnpm lint
```

Expected: 0 ошибок. Если `Link to="/dashboard"` подсвечивается как несуществующий route — значит `routeTree.gen.ts` не пересобрался в Task 8; вернись к Task 8 Step 2.

- [ ] **Step 3: Коммит**

```bash
git add apps/frontend/src/common/ui/navigation/Navigation.tsx
git commit -m "client: пункт навигации Дашборд"
```

---

### Task 10: Финальная Playwright-верификация и code review

**Files:** не правит код, только проверяет.

- [ ] **Step 1: Поднять dev-серверы (frontend + server)**

Из корня проекта:

```bash
pnpm dev
```

Ожидание: Vite запустится на `http://localhost:5173` (или порт, указанный в выводе), Fastify-сервер — на `http://localhost:3000`.

- [ ] **Step 2: Вручную или через Playwright MCP пройти чек-лист**

Открой `http://localhost:5173`, авторизуйся (если требуется), затем проверь по пунктам:

1. **Главная (`/`)** — форма быстрого ввода и список последних 2 дней работают как раньше (регрессия не появилась).
2. **Навигация** — внизу видны 4 пункта: «Расходы», «Дашборд», «Категории», «Настройки».
3. **Переход на `/dashboard`** — открывается заголовок «Дашборд», переключатель «день / неделя / месяц», большая сумма, чипы категорий, список трат по дням.
4. **По умолчанию выбран** период «неделя» и категория «все» — сумма соответствует тратам за 7 дней.
5. **Переключение периода** — выбор «день» или «месяц» меняет и сумму, и список (становится короче или длиннее). Активный период визуально выделен.
6. **Фильтр категории** — выбор конкретной категории (например, «еда»):
   - сумма пересчитывается;
   - в списке остаются только дни с тратами этой категории;
   - подытог дня в шапке группы соответствует видимым тратам (не всем тратам дня);
   - активный chip визуально выделен `--accent-color`.
7. **Сброс фильтра** — клик «все» возвращает все категории.
8. **Пустое состояние «нет трат за период»** — выбери период, в котором трат нет (если данных мало). Должно показать «Нет трат за период».
9. **Пустое состояние «в категории трат нет»** — выбери категорию, в которой нет трат за выбранный период. Должна показаться надпись «В этой категории трат за период нет» и кнопка «показать все», клик по которой сбрасывает фильтр.
10. **Свертывание группы дня** в списке работает (regression check для функционала из предыдущей итерации).

- [ ] **Step 3: Запустить code review через pr-review-toolkit**

Используй subagent `pr-review-toolkit:code-reviewer` с указанием на полный diff всех коммитов этого плана:

```bash
git log --oneline master..HEAD
git diff master..HEAD
```

Передай агенту:
- список измененных файлов (`git diff --name-only master..HEAD`),
- спецификацию `docs/superpowers/specs/2026-04-25-expenses-dashboard-design.md`,
- инструкцию: «проверь соответствие spec, фрактальной архитектуре проекта, отсутствие импорта из внутренних путей чужих модулей, корректность типов и пропсов, использование CSS-переменных вместо хардкода цветов».

- [ ] **Step 4: Исправить замечания (если есть) и сделать финальный коммит**

Если ревьюер нашёл проблемы — поправь, прогоняй `ts:check && lint`, коммить отдельным коммитом с префиксом `client:` и описанием правки. Если замечаний нет — переходи к Step 5.

- [ ] **Step 5: Финальная сборка**

```bash
cd apps/frontend && pnpm build:local
```

Expected: сборка успешна, в `dist/` появляются артефакты, нет TS-ошибок.

---

## Self-Review

Просмотрел план против спецификации. Покрытие:

- **Архитектура** (spec §Architecture) → Tasks 7 (страница-оркестратор), 5 (PeriodSummary), 6 (CategoryFilter), 4 (ExpensesByDays).
- **Routing & Navigation** (spec §Routing) → Tasks 8 (маршрут), 9 (пункт меню).
- **Page** (spec §Page) → Task 7.
- **Widget: PeriodSummary** (spec §Widget: PeriodSummary) → Task 5.
- **Widget: CategoryFilter** (spec §Widget: CategoryFilter) → Task 6.
- **Changes: useExpenses** (spec §Changes: useExpenses) → Task 2.
- **Changes: ExpensesByDays** (spec §Changes: ExpensesByDays) → Task 4.
- **Empty States** (spec §Empty States) → Task 3 (компонент) + Task 4 (интеграция и проброс onResetCategory).
- **Palette** (spec §Palette) → Task 1.
- **Loading & Error States** (spec §Loading & Error States) → реализованы внутри Task 4 (ExpensesByDays Loader + EmptyState) и Task 5 (PeriodSummary Loader); ошибки уже обрабатываются в `useExpenses` через нотификации, доп. таска не нужна.
- **Public APIs** (spec §Public APIs) → Tasks 5 step 4, 6 step 3, 7 step 3.
- **Manual Verification** (spec §Manual Verification) → Task 10.

**Type consistency check:**
- `Period`, `PERIOD_DAYS`, `periodToDays` — определены в Task 5 step 1, импортируются в Task 7 step 2. Имена совпадают.
- `EmptyState` пропсы (`variant`, `onReset`) — Task 3 step 1; используются в Task 4 step 1 как `variant`/`onReset`. Совпадает.
- `ExpensesByDays` пропсы (`days?`, `categoryId?`, `onResetCategory?`) — Task 4 step 1; используются в Task 7 step 2 как `days`, `categoryId`, `onResetCategory`. Совпадает.
- `PeriodSummary` пропсы (`days`, `categoryId`, `period`, `onPeriodChange`) — Task 5 step 3; используются в Task 7 step 2. Совпадает.
- `CategoryFilter` пропсы (`value`, `onChange`) — Task 6 step 2; используются в Task 7 step 2 как `value={categoryId}`/`onChange={setCategoryId}`. Совпадает.

**Placeholder scan:** TODO/TBD/«handle edge cases»/«write tests for the above» в плане не использовал. Все шаги с кодом содержат конкретный код. Все команды — точные.

**Замечание по Task 8:** TanStack Router file-routes требует автогенерации `routeTree.gen.ts`. Step 2 описывает запасной путь через `pnpm dev` если `ts:check` не подтянет изменения сразу — это рабочая практика в проекте (видно по существующим маршрутам).
