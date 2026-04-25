# Design: Expenses Dashboard

**Date:** 2026-04-25

## Goal

Новая страница `/dashboard` — минималистичный дашборд с тратами. Показывает большую сумму за выбранный период (день / неделя / месяц), фильтр по одной категории и список трат, сгруппированный по дням (переиспользует существующий `ExpensesByDays`).

Главная (`/`) с быстрым вводом и последними двумя днями остаётся без изменений.

## Scope

- **In:** новый маршрут, новая страница-оркестратор, два новых виджета (`PeriodSummary`, `CategoryFilter`), параметризация `useExpenses`, расширение `ExpensesByDays` пропсами, расширение палитры, пункт навигации.
- **Out:** редактирование/удаление трат, серверный фильтр по категории, графики/визуализации, скользящие/настраиваемые периоды, URL-state (search params), сравнение с прошлым периодом, dark-тема для всего приложения (только дополнение переменных, нужных дашборду).

## Architecture

```
Dashboard (state: period, categoryId)
   ├─ PeriodSummary { period, days, categoryId, onPeriodChange }
   ├─ CategoryFilter { value: categoryId, onChange }
   └─ ExpensesByDays { days, categoryId }
         └─ useExpenses(days) → фильтр по categoryId → groupByDay
```

**Принцип:** страница держит только UI-состояние (период, выбранная категория). Виджеты загружают и рендерят данные. `PeriodSummary` и `ExpensesByDays` зовут общий хук `useExpenses(days)` с одинаковым аргументом — TanStack Query кэширует ответ по ключу, значит **одна сеть = один источник правды для суммы и списка**.

**Фильтр по категории — клиентский.** Текущий API не принимает `categoryId`; для MVP при горизонте 30 дней это десятки-сотни записей, не узкое место. Если станет — добавим в TypeSpec и серверную ручку.

## Routing & Navigation

### Маршрут

Новый файл `apps/frontend/src/app/routes/_private/dashboard.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/dashboard";

export const Route = createFileRoute("/_private/dashboard")({
  component: Dashboard,
});
```

### Навигация

В `common/ui/navigation/Navigation.tsx` добавляется пункт **между** «Расходы» и «Категории»:

```tsx
<li className={s.navItem}><Link to="/dashboard">Дашборд</Link></li>
```

## Page

### `pages/dashboard/`

```
pages/dashboard/
  Dashboard.tsx
  Dashboard.module.css
  index.ts            // экспортирует только Dashboard
```

### `Dashboard.tsx`

```tsx
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
      <ExpensesByDays days={days} categoryId={categoryId} />
    </div>
  );
}
```

`Dashboard.module.css` — вертикальный flex, `gap: 24px`, заголовок `font-size: 24px; font-weight: 400; letter-spacing: -0.03em` (как `.title` в `CreateExpense`).

### Тип периода

```ts
// modules/expenses/modules/period-summary/model/types.ts
export type Period = "day" | "week" | "month";
export const PERIOD_DAYS: Record<Period, number> = { day: 1, week: 7, month: 30 };
export const periodToDays = (p: Period): number => PERIOD_DAYS[p];
```

`Period` и `periodToDays` экспортируются из `modules/expenses/modules/period-summary/index.ts`. `Dashboard.tsx` импортирует их оттуда.

## Widget: `PeriodSummary`

### Расположение и API

```
modules/expenses/modules/period-summary/
  index.ts               // PeriodSummary, Period, periodToDays
  ui/
    PeriodSummary.tsx
    PeriodSummary.module.css
  model/
    types.ts
```

```ts
type Props = {
  days: number;
  categoryId: number | null;
  period: Period;
  onPeriodChange: (p: Period) => void;
};
```

### Поведение

- Зовёт `useExpenses(days)` — тот же запрос, что и `ExpensesByDays`, кэшируется TanStack Query.
- Считает `total` через `useMemo`: плоский `groups → expenses`, фильтр `categoryId == null || e.categoryId === categoryId`, `reduce(sum + amount)`.
- Во время загрузки в месте суммы — `<Loader />`. Переключатель периода **активен и в загрузке** (пользователь может тыкнуть другой период, не дожидаясь ответа).
- Сумма форматируется: `total.toLocaleString("ru") + " ₽"`.

### Структура UI

```
[ день ][ неделя ][ месяц ]    ← .switcher
        12 540 ₽               ← .amount (font-size: 32px, font-weight: 500)
```

### CSS-классы

- `.summary` — вертикальный flex, `gap: 16px`, выравнивание по центру.
- `.switcher` — горизонтальный flex, фон `--primary-color`, `border-radius: 12px`, `padding: 4px`. Тот же визуальный паттерн, что в `Navigation` (единообразие).
- `.switchBtn` — прозрачная кнопка, `padding: 6px 14px`, `font-size: 12px`, `border-radius: 8px`, `cursor: pointer`, `transition: background-color 0.15s, color 0.15s`.
- `.switchBtnActive` — `background-color: var(--secondary-color)`, `color: var(--secondary-text-color)`.
- `.amount` — `font-size: 32px`, `font-weight: 500`, `color: var(--primary-text-color)`.

### Доступность

- `role="tablist"` на `.switcher`, `role="tab"` + `aria-selected` на каждой `.switchBtn`.

## Widget: `CategoryFilter`

### Расположение и API

```
modules/expenses/modules/category-filter/
  index.ts            // CategoryFilter
  ui/
    CategoryFilter.tsx
    CategoryFilter.module.css
```

```ts
type Props = {
  value: number | null;
  onChange: (id: number | null) => void;
};
```

### Поведение

- Зовёт `useCategories()` (существующий хук в `modules/categories`).
- Рендерит чип «все» (соответствует `value === null`) и по чипу на каждую категорию из ответа.
- Клик по чипу зовёт `onChange(id)` или `onChange(null)` для «все».

### CSS-классы

- `.chips` — `display: flex`, `flex-wrap: wrap`, `gap: 6px`.
- `.chip` — кнопка, `padding: 4px 10px`, `font-size: 12px`, `border-radius: 999px`, фон `var(--surface-color)`, цвет `var(--primary-text-color)`, `cursor: pointer`, `transition: background-color 0.15s, color 0.15s`.
- `.chipActive` — `background-color: var(--accent-color)`, `color: var(--accent-text-color)`.

### Доступность

- `role="tablist"` на `.chips`, `role="tab"` + `aria-selected` на каждом `.chip`.

## Changes: `useExpenses`

Хук становится принимающим `days` с дефолтом, чтобы существующий вызов в `Main` не сломался.

```ts
const DEFAULT_DAYS = 2;

export function useExpenses(days: number = DEFAULT_DAYS) {
  const { data, isError, error, isLoading } = useExpensesList({ days });
  // остальное без изменений
}
```

Существующий вызов `useExpenses()` в `<ExpensesByDays />` (через `Main`) сохраняет поведение «последние 2 дня».

## Changes: `ExpensesByDays`

Компонент принимает три опциональных пропса. Сигнатура без пропсов остаётся валидной — поведение для `Main` не меняется.

```tsx
type Props = {
  days?: number;
  categoryId?: number | null;
  onResetCategory?: () => void;
};

export function ExpensesByDays({
  days,
  categoryId = null,
  onResetCategory,
}: Props = {}) {
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

**Ключевые моменты:**

1. Подытог дня (`total`) пересчитывается **после** фильтрации по категории. Иначе шапка группы покажет сумму всех трат дня, а раскрытый список — только подходящие, и пользователь увидит несостыковку.
2. `onResetCategory` пробрасывается в `EmptyState` только в варианте `no-match`. На главной (`Main` не передаёт этот пропс) — кнопка сброса не появится.

## Empty States

Новый приватный компонент `modules/expenses/ui/ExpensesByDays/EmptyState.tsx` — не экспортируется наружу модуля.

```tsx
type Props = {
  variant: "empty" | "no-match";
  onReset?: () => void;
};

export function EmptyState({ variant, onReset }: Props) {
  if (variant === "empty") {
    return <div className={s.emptyState}>Нет трат за период</div>;
  }
  return (
    <div className={s.emptyState}>
      <p>В этой категории трат за период нет</p>
      {onReset && (
        <button type="button" className={s.resetLink} onClick={onReset}>
          показать все
        </button>
      )}
    </div>
  );
}
```

**Передача `onReset`:** дашборд передаёт `onResetCategory` в `ExpensesByDays`, который пробрасывает его в `EmptyState` как `onReset` (только для варианта `no-match` — см. сигнатуру в секции «Changes: `ExpensesByDays`»).

Дашборд использует так:

```tsx
<ExpensesByDays
  days={days}
  categoryId={categoryId}
  onResetCategory={() => setCategoryId(null)}
/>
```

### CSS

- `.emptyState` — центрирование текста, `padding: 32px 16px`, `color: var(--muted-text-color)`, `font-size: 14px`.
- `.resetLink` — текстовая кнопка, без рамки, `color: var(--accent-color)`, `font-size: 14px`, `cursor: pointer`, `padding: 0`, `background: none`, `text-decoration: underline`.

## Palette

В `apps/frontend/src/app/styles/global.css` дополняем существующие медиа-запросы. Существующие переменные не меняем.

```css
@media (prefers-color-scheme: light) {
    :root {
        /* существующие сохраняются */
        --primary-color: #FDFDFD;
        --primary-text-color: #242229;
        --secondary-color: #333334;
        --secondary-text-color: #F3F3F3;

        /* добавляются */
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
        /* существующие сохраняются */
        --primary-color: #4e4e4e;
        --secondary-color: #bfbfbf;

        /* добавляются */
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

**Назначения:**
- `--accent-color` — активный chip категории, текстовая ссылка «показать все».
- `--accent-text-color` — текст на `--accent-color`.
- `--muted-text-color` — текст пустого состояния, в перспективе можно мигрировать `opacity: 0.6` из `expenseDay.module.css` (вне scope).
- `--surface-color` — фон чипов категорий (отличие от `--primary-color`, чтобы виделось различие неактивного чипа от фона страницы).
- `--divider-color` — резерв; в этом дизайне не используется напрямую, но добавляется для консистентности палитры.

## Loading & Error States

- **Загрузка `PeriodSummary`:** `<Loader />` вместо суммы; переключатель периода активен.
- **Загрузка `ExpensesByDays`:** `<Loader />` вместо списка (текущее поведение).
- **Глобальный лоадер** в `PrivateLayout` остаётся как есть.
- **Ошибки** обрабатываются в `useExpenses` через `addNotification` (текущее поведение). При ошибке `groups` пустой — отрендерится `EmptyState variant="empty"`.

## Public APIs

```ts
// pages/dashboard/index.ts
export { Dashboard } from "./Dashboard";

// modules/expenses/modules/period-summary/index.ts
export { PeriodSummary } from "./ui/PeriodSummary";
export { type Period, PERIOD_DAYS, periodToDays } from "./model/types";

// modules/expenses/modules/category-filter/index.ts
export { CategoryFilter } from "./ui/CategoryFilter";
```

`modules/expenses/index.ts` — без изменений (новые подмодули не реэкспортируются на уровень `modules/expenses`, они импортируются по своим публичным entry-points в соответствии с фрактальной архитектурой).

## Files to Add

- `apps/frontend/src/app/routes/_private/dashboard.tsx`
- `apps/frontend/src/pages/dashboard/Dashboard.tsx`
- `apps/frontend/src/pages/dashboard/Dashboard.module.css`
- `apps/frontend/src/pages/dashboard/index.ts`
- `apps/frontend/src/modules/expenses/modules/period-summary/index.ts`
- `apps/frontend/src/modules/expenses/modules/period-summary/model/types.ts`
- `apps/frontend/src/modules/expenses/modules/period-summary/ui/PeriodSummary.tsx`
- `apps/frontend/src/modules/expenses/modules/period-summary/ui/PeriodSummary.module.css`
- `apps/frontend/src/modules/expenses/modules/category-filter/index.ts`
- `apps/frontend/src/modules/expenses/modules/category-filter/ui/CategoryFilter.tsx`
- `apps/frontend/src/modules/expenses/modules/category-filter/ui/CategoryFilter.module.css`
- `apps/frontend/src/modules/expenses/ui/ExpensesByDays/EmptyState.tsx`

## Files to Modify

- `apps/frontend/src/modules/expenses/useExpenses.ts` — параметр `days`.
- `apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.tsx` — пропсы `days`, `categoryId`, `onResetCategory`; фильтр; пустое состояние.
- `apps/frontend/src/modules/expenses/ui/ExpensesByDays/ExpensesByDays.module.css` — стили `.emptyState`, `.resetLink`.
- `apps/frontend/src/common/ui/navigation/Navigation.tsx` — пункт «Дашборд».
- `apps/frontend/src/app/styles/global.css` — новые CSS-переменные.
- `apps/frontend/src/app/routes/routeTree.gen.ts` — будет пересобран автоматически при работе TanStack Router.

## Manual Verification

После реализации проверить через Playwright (правило проекта):

1. На главной (`/`) форма ввода и список двух дней работают как раньше.
2. В навигации виден пункт «Дашборд», переход на `/dashboard` работает.
3. На дашборде видна большая сумма за неделю (по умолчанию), переключение «день / неделя / месяц» меняет сумму и список.
4. Чипы категорий рендерятся, выбор категории фильтрует и сумму, и список; подытог дня соответствует видимым тратам.
5. Пустые состояния: при отсутствии трат показывается «Нет трат за период»; при пустой категории — текст с кнопкой «показать все», клик сбрасывает фильтр.
6. Тёмная тема (если переключить ОС) не ломает читаемость новых элементов.

## Out-of-Scope (для будущих итераций)

- Добавление `categoryId` в `GET /expenses` (TypeSpec + сервер) — если фильтр станет узким местом.
- URL search-params (`?period=week&category=5`) — для deep linking.
- Графики и сравнение с прошлым периодом.
- Редактирование/удаление трат с дашборда.
- Полноценная dark-тема для всего приложения.
