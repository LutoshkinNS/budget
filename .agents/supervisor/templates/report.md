---
schema_version: 1
kind: agent-result
role: supervisor
task: "projects/tasks/<feature>/work-items/<task>.md"
run: "<run>"
attempt: 0
result: blocked
revision:
  commit: "<полный git rev-parse HEAD>"
  dirty: true
  evidence:
    - "projects/tasks/<work>/sessions/<run>/evidence/supervisor-snapshot.json"
checks:
  - name: acceptance-review
    result: blocked
    reason: "<невыполненный критерий или обязательная проверка>"
artifacts: []
---

# Итог смотрителя

## Принятый результат

<Соответствие ТЗ, рассмотренные отчёты исполнителей и доказательства по критериям. Для этапа до публикации задач допускается task: null.>

## Проверки и статус задачи

<Что выполнено, какой статус синхронизирован в задаче и индексе; YAML result не заменяет этот статус.>

## Ограничения и продолжение

<Оставшиеся проблемы, backlog и следующий шаг; ссылка на checkpoint для незавершённой работы.>
