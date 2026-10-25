# Учёт токенов по задаче

Используй сборщик после публикации задачи, чтобы вручную связать расход supervisor и исполнителей с задачей. Он читает локальные JSONL сессии и сохраняет manifest и отчёт внутри каталога проектной сессии. Команда не меняет статусы задачи и не запускает хуки автоматически.

## Рабочий цикл

Из корня репозитория укажи путь задачи, опубликованной в `projects/tasks/`, и thread ID из события `session_meta`:

```powershell
pnpm agents:tokens start projects/tasks/<work>/sessions/<run> --task projects/tasks/<feature>/work-items/<task>.md --thread <supervisor-thread-id>
pnpm agents:tokens attach projects/tasks/<work>/sessions/<run> --task projects/tasks/<feature>/work-items/<task>.md --thread <developer-thread-id> --role developer --attempt 0 --from-start
pnpm agents:tokens stop projects/tasks/<work>/sessions/<run> --thread <developer-thread-id>
pnpm agents:tokens report projects/tasks/<work>/sessions/<run> --format markdown
pnpm agents:tokens stop projects/tasks/<work>/sessions/<run> --thread <supervisor-thread-id>
pnpm agents:tokens report projects/tasks/<work>/sessions/<run> --format json --output projects/tasks/<work>/sessions/<run>/tokens.json
```

Для нового интервала того же потока сначала выполни `stop`, затем `attach` с нужной задачей, ролью и попыткой. `--from-start` применяй только при первом присоединении потока, когда нужен весь доступный журнал. По умолчанию сбор начинается с текущего checkpoint. По умолчанию sessions-root — `~/.codex/sessions`; для изолированного теста передай `--sessions-root <dir>`.

## Как читать отчёт

JSON содержит строки по задаче, роли, модели и попытке; Markdown показывает те же наблюдаемые суммы и причины неполноты. Суммируются только валидные `token_usage_record.payload.usage` выбранных окон. Input и output дают total; cached input и reasoning output являются их подмножествами и повторно не прибавляются. Неизвестные подкатегории остаются неизвестными.

Открытые интервалы, активный turn, незавершённый хвост журнала, отсутствующий model context, изменения/недоступность источника, конфликт ответа, fork и другие diagnostics означают provisional, partial или unknown. Это фактическая сумма доступных записей, а не оценка billing/quota и не гарантия полного расхода всей работы. `token_count` не используется как запасной источник. Прочитай diagnostics перед передачей отчёта на принятие.

Источник сессии выбирается по `session_meta.id`; неоднозначный ID требует ручного разбора. Тексты сообщений, prompts и аргументы инструментов в manifest и отчёт не копируются.
