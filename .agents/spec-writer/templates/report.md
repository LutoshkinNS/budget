---
schema_version: 1
kind: agent-result
role: spec-writer
task: null
run: "<run>"
attempt: 0
result: blocked
revision:
  commit: "<полный git rev-parse HEAD>"
  dirty: true
  evidence:
    - ".agents/project/sessions/<run>/evidence/spec-writer-snapshot.json"
checks:
  - name: requirements-reviewed
    result: blocked
    reason: "<что требуется для завершения поручения>"
artifacts: []
---

# Результат составления ТЗ

## Подготовленные материалы

<Черновик ТЗ, задачи после согласования, изученные исходники и ограничения. После публикации задачи замени task: null на путь к ней.>

## Решения и вопросы

<Что подтверждено пользователем, какие вопросы передаются смотрителю. Итог pass говорит о выполнении поручения, согласование пользователем фиксируется отдельно.>

## Передача смотрителю

<Следующий шаг, предлагаемые изменения памяти и ограничения.>
