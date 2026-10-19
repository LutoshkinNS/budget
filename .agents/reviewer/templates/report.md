---
schema_version: 1
kind: agent-result
role: reviewer
task: ".agents/project/tasks/<feature>/<task>.md"
run: "<run>"
attempt: 0
result: blocked
revision:
  commit: "<полный git rev-parse HEAD>"
  dirty: true
  evidence:
    - ".agents/project/sessions/<run>/evidence/reviewer-snapshot.json"
checks:
  - name: spec-review
    result: blocked
    reason: "<что требуется для проверки соответствия ТЗ>"
  - name: standards-review
    result: blocked
    reason: "<что требуется для проверки архитектуры и проектных правил>"
artifacts: []
---

# Результат review

## Проверенный срез

<Пути задачи и согласованной spec; baseline SHA и способ сравнения; границы diff; финальный commit и dirty snapshot/evidence, включая нужные untracked-файлы. Подтверди актуальность в конце review.>

## Проверки и покрытие

<По каждой оси: AC/правило → изученные пути и строки → evidence → pass/fail/blocked. Укажи применимые пункты чеклиста и причины н/п, ограничения и непроверенные области. Для выполненных команд — command, cwd, env, exit code и результат; чужое evidence подпиши владельцем и версией среза.>

## Findings

| ID / severity | Ось / AC или правило | Path:line | Условия, дефект и влияние | Ожидаемый результат / направление исправления | Evidence |
| --- | --- | --- | --- | --- | --- |
| <F-1 / P2> | <Spec / AC-1 либо Standards / правило> | <путь:строка> | <подтверждённая причина и последствие> | <проверяемый результат исправления> | <путь/строки/сценарий> |

<Если findings нет — «не обнаружены в выполненных проверках» вместо строки-примера. При повторной проверке укажи судьбу затронутых F-ID и влияние исправлений.>

## Передача supervisor

<Результат и основания; блокеры и условия продолжения; findings для developer, регрессии для tester; созданные review-артефакты и устаревшие результаты. Предварительные design/task notes укажи ссылкой, они не заменяют этот отчёт. Статусы и общую память публикует supervisor.>
