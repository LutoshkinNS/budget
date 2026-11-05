# Учёт токенов и покрытия назначений

Используй этот документ после публикации задачи. Реестр назначений и token manifest — отдельные входы: первый фиксирует известные запуски supervisor, второй — измерительные окна. Ни один из них не подтверждает runtime-состояние чата или полный расход.

## Реестр запусков

Supervisor создаёт и обновляет `projects/tasks/<work>/sessions/<run>/launches.json` обычной записью после запуска каждого назначенного потока. Intake до согласованной границы не добавляй задним числом; неназначенные потоки, включая guardian, не записывай фиктивной ролью.

```json
{
  "schema_version": 1,
  "kind": "agent-launch-registry",
  "run": "example-run",
  "launches": [
    {
      "thread_id": "known-thread-id",
      "task": "projects/tasks/example/work-items/1-change.md",
      "role": "developer",
      "attempt": 0,
      "state": "open"
    }
  ]
}
```

Все поля обязательны; дополнительные поля запрещены. `launches` может быть пустым. `run` равен имени каталога сессии. `task` — существующий файл `work-items` той же работы, путь от корня с `/`, без traversal. Роль — `supervisor`, `spec-writer`, `developer`, `tester` или `reviewer`; попытка — целое 0–3; состояние — `open` или `closed`. Tuple `(thread_id, task, role, attempt)` уникален: новое назначение потока создаёт tuple, повтор того же tuple обновляет запись.

После запуска запиши ID со `state: open`, затем выполняй `start`/`attach`; после завершения учётного окна выполняй `stop` и ставь `closed`. `open` допускает незакрытые окна; `closed` требует, чтобы все окна tuple были закрыты. Эти ручные отметки не следят за чатом.

## Учётные окна

Из корня репозитория укажи задачу и thread ID из `session_meta`:

```powershell
pnpm agents:tokens start projects/tasks/<work>/sessions/<run> --task projects/tasks/<work>/work-items/<task>.md --thread <supervisor-thread-id>
pnpm agents:tokens attach projects/tasks/<work>/sessions/<run> --task projects/tasks/<work>/work-items/<task>.md --thread <developer-thread-id> --role developer --attempt 0 --from-start
pnpm agents:tokens stop projects/tasks/<work>/sessions/<run> --thread <developer-thread-id>
pnpm agents:tokens report projects/tasks/<work>/sessions/<run> --format markdown
```

Для нового окна того же потока сначала `stop`, затем `attach` с актуальными task/role/attempt. `--from-start` применяй только при первом attach, если нужен доступный журнал целиком. Иначе сбор начинается с текущего checkpoint. По умолчанию JSONL берётся из `~/.codex/sessions`; для изолированного запуска можно задать `--sessions-root <dir>`. Старые команды не требуют launches.json.

## Coverage

Запусти локальную сверку из корня:

```powershell
pnpm agents:tokens coverage projects/tasks/<work>/sessions/<run>
pnpm agents:tokens coverage projects/tasks/<work>/sessions/<run> --format markdown
```

Coverage читает только launches.json, token-manifest.json и файлы задач для проверки пути. JSONL и `~/.codex/sessions` не нужны. Команда печатает только в stdout, не создаёт файлов и не принимает `--output`, `--sessions-root` или другие опции кроме `--format`. linked paths и некорректные существующие входы дают exit 1; валидные `partial`/`unknown` возвращают exit 0.

`complete` означает, что реестр согласуется с окнами и все записи `closed` закрыты. `partial` показывает расхождения либо отсутствующий manifest при существующем registry. `unknown` с `registry_missing` означает старую сессию без реестра; полнота назначений не утверждается. Отсутствующий manifest при наличии реестра даёт `manifest_missing` и missing для назначений. Если registry отсутствует, coverage возвращает `unknown`; существующий manifest всё равно валидируется, и ошибка не скрывается.

Диагностики: `missing_interval` (thread отсутствует), `ownership_mismatch` (у thread есть окна другого tuple), `unregistered_interval` (manifest-only окно), `unclosed_interval` (закрытый tuple содержит открытое окно), `manifest_missing` и `registry_missing`. Одно окно может показать обе стороны несоответствия. Нормальное открытое окно выводится в `open` и само не делает coverage частичным; tuple `open` со всеми закрытыми окнами допустим. JSON и Markdown показывают статус, открытые окна и диагностики без текстов сообщений.

Coverage не читает JSONL, не меняет manifest, результаты или статусы и не принимает приложение. Даже `complete` coverage не означает полный расход токенов.

## Интерпретация report

Отчёт суммирует только валидные `token_usage_record.payload.usage` выбранных окон. Input и output дают total; cached input и reasoning output являются подмножествами. Неизвестные категории остаются неизвестными. Открытый интервал, активный turn, неполный хвост журнала, отсутствующий model context, изменение/недоступность источника, конфликт ответа, fork и другие diagnostics означают provisional, partial или unknown. `token_count` не используется как замена. Отчёт — наблюдаемые данные, не billing/quota и не гарантия полного расхода.

Источник JSONL выбирается по `session_meta.id`; неоднозначный ID требует ручного разбора. Тексты сообщений, prompts и аргументы инструментов в manifest/report не копируются. Отдельная диагностика неназначенного дочернего потока сохраняется и не превращается в запись registry.
