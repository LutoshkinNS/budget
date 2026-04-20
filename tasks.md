# Tasks

## [TODO] Траты за последние дни с асинхронной загрузкой

**Цель:** показывать траты за последние 2 дня, сгруппированные по дням с заголовком и итогом, загружать список асинхронно чтобы не блокировать форму ввода.

**Дизайн:** Figma → фрейм `days` в `main light` (file: `aORFtgYVsY79JB7flU3Cvf`)
```
[ сегодня        12 340 ₽ ↓ ]
  Продукты    1 200 ₽
  Обеды         450 ₽
[ вчера            500 ₽ ↓ ]
  Машина        500 ₽
```

**Шаги:**

1. **TypeSpec** — добавить `@query days?: integer` в `list()` в `packages/api-contracts/typespec/main.tsp`
2. **Регенерация** — `npm run typespec:generate` + `npm run typespec:generateTsSchemas` (из `apps/server/`)
3. **Сервер** — в `apps/server/src/domains/expenses/expenses.ts` добавить querystring-фильтр по дате (последние N дней)
4. **Клиент** — `npm run api:generate` (из `apps/frontend/`)
5. **Хук** — обновить `modules/expenses/model/useExpenses.ts`: передавать `days: 2`, группировать по дате, считать итоги, формировать лейблы (сегодня/вчера/дата)
6. **Новые компоненты:**
   - `modules/expenses/ui/ExpenseDayHeader.tsx` — заголовок дня (лейбл + сумма + иконка)
   - `modules/expenses/ui/ExpenseDayItem.tsx` — строка отдельной траты
   - `modules/expenses/ui/ExpensesByDays.tsx` — контейнер (заменяет `ExpenseList`)
   - `modules/expenses/ui/expenseDays.module.css`
7. **Main.tsx** — обернуть `ExpensesByDays` в `<Suspense>` для асинхронной загрузки
8. **Barrel** — обновить `modules/expenses/index.ts`

**Полный план:** `~/.claude/plans/bubbly-riding-reddy.md`
