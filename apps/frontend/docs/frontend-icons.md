# SVG и иконки во фронтенде

Переиспользуемые SVG-иконки находятся в `apps/frontend/src/common/assets/icons`.
Для отображения используется компонент
[`SvgIcon`](../src/common/ui/svg-icon/svg-icon.tsx).

## Импорт

Импорт `*.svg?react` через `vite-plugin-svgr` возвращает типизированный
React-компонент. Обычный импорт `*.svg` возвращает URL файла.

```tsx
import ExpensesIcon from "@/common/assets/icons/expenses.svg?react";
import { SvgIcon } from "@/common/ui/svg-icon/svg-icon";

<SvgIcon component={ExpensesIcon} />;
```

Типы импортов подключены через `vite-plugin-svgr/client` в
`apps/frontend/tsconfig.app.json`; плагин подключён в `apps/frontend/vite.config.ts`.

## Размер и доступность

`SvgIcon` задаёт размер, CSS-класс и доступность SVG:

- `size` задаёт ширину и высоту в пикселях; по умолчанию `24`.
- `className` позволяет применить дополнительные стили.
- Без `label` иконка декоративная и скрыта от скринридеров.
- С `label` иконка получает `role="img"` и доступное имя.

```tsx
<SvgIcon component={ExpensesIcon} size={20} label="Расходы" />
```

Если иконка находится внутри подписанной кнопки или ссылки, оставляйте её
декоративной: доступное имя задаётся самому интерактивному элементу.

## Цвет

Одноцветные иконки наследуют CSS-свойство `color` через `currentColor`.
У новых одноцветных SVG используйте `fill="currentColor"` или
`stroke="currentColor"` вместо фиксированного цвета.

Локальная конфигурация
[`common/assets/icons/.svgrrc.json`](../src/common/assets/icons/.svgrrc.json)
заменяет цвета `#626166` и `#0E0C14` на `currentColor` при импорте иконок как
React-компонентов. Она действует только внутри этой директории и не меняет
исходные цвета остальных SVG. Обычный импорт SVG как URL не проходит через SVGR.

Многоцветные иллюстрации не следует помещать в эту директорию, если их палитра
должна сохраняться без такой замены.
