---
schema_version: 1
kind: agent-result
role: developer
task: "projects/tasks/<feature>/work-items/<task>.md"
run: "<run>"
attempt: 0
result: blocked
revision:
  commit: "<полный git rev-parse HEAD>"
  dirty: true
  evidence:
    - "projects/tasks/<work>/sessions/<run>/evidence/developer-snapshot.json"
checks:
  - name: implementation-check
    result: blocked
    reason: "<что требуется для проверки реализации>"
artifacts: []
---

# Результат разработки

## Изменения

<Какие файлы и поведение изменены, с какими критериями это связано.>

## Проверки

<Точные команды, результаты, evidence и версия проверяемого среза.>

## Передача смотрителю

<Ограничения, дефекты и что требуется от тестировщика; общий статус задачи обновляет смотритель.>
