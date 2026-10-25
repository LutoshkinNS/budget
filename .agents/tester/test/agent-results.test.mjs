import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

import {
  buildSummary,
  loadResults,
  writeSummary,
} from "../../supervisor/scripts/agent-results.mjs";

const roles = ["supervisor", "spec-writer", "developer", "tester", "reviewer"];
const taskPath = ".agents/project/tasks/feature/task.md";
const run = "test-run";
const sessionPath = `.agents/project/sessions/${run}`;
const resultsPath = `${sessionPath}/results`;
const evidencePath = `${sessionPath}/evidence/working-tree.patch`;
const artifactPath = `${sessionPath}/evidence/check.log`;
const summaryPath = `${sessionPath}/summary.yaml`;
const temporaryPrefix = "budget-agent-results-test-";
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

function metadata(overrides = {}) {
  return {
    schema_version: 1,
    kind: "agent-result",
    role: "tester",
    task: taskPath,
    run,
    attempt: 0,
    result: "pass",
    revision: {
      commit: "a".repeat(40),
      dirty: true,
      evidence: [evidencePath],
    },
    checks: [
      {
        name: "Integration checks",
        result: "pass",
        command: "node --test",
        exit_code: 0,
      },
    ],
    artifacts: [artifactPath],
    ...overrides,
  };
}

function reportSource(
  value,
  body = "# Result\n\nVerified the acceptance criteria.\n",
) {
  return `---\n${stringify(value)}---\n${body}`;
}

async function fixture(t, { withTask = true } = {}) {
  const temporaryParent = path.resolve(os.tmpdir());
  const root = await mkdtemp(path.join(temporaryParent, temporaryPrefix));
  t.after(async () => {
    // Удаляем только непосредственный временный каталог, созданный этой fixture.
    assert.equal(path.dirname(path.resolve(root)), temporaryParent);
    assert.ok(path.basename(root).startsWith(temporaryPrefix));
    assert.notEqual(path.resolve(root), path.resolve(repoRoot));
    await rm(root, { recursive: true, force: true });
  });

  async function put(relativePath, content) {
    const target = path.resolve(root, relativePath);
    assert.ok(target.startsWith(`${root}${path.sep}`));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    return relativePath;
  }

  async function report(overrides = {}, options = {}) {
    const value = metadata(overrides);
    const relativePath =
      options.path ??
      `.agents/project/sessions/${value.run}/results/${value.role}-${value.attempt}.md`;
    await put(
      relativePath,
      options.source ?? reportSource(value, options.body),
    );
    return { path: relativePath, metadata: value };
  }

  if (withTask) {
    await put(
      taskPath,
      "# Fixture task — status: in-progress\n\nCanonical task content.\n",
    );
  }
  await put(evidencePath, "diff --git a/example b/example\n+verified change\n");
  await put(artifactPath, "Integration checks passed.\n");
  return { root, put, report };
}

async function snapshot(root) {
  const entries = [];
  async function visit(directory, prefix = "") {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      const relativePath = `${prefix}${child.name}`;
      const absolutePath = path.join(directory, child.name);
      if (child.isDirectory()) {
        entries.push([`${relativePath}/`, null]);
        await visit(absolutePath, `${relativePath}/`);
      } else {
        entries.push([
          relativePath,
          (await readFile(absolutePath)).toString("hex"),
        ]);
      }
    }
  }
  await visit(root);
  return entries;
}

async function expectRejectedReport(t, overrides, options) {
  const repository = await fixture(t);
  const report = await repository.report(overrides, options);
  const before = await snapshot(repository.root);
  await assert.rejects(() =>
    loadResults([report.path], { root: repository.root }),
  );
  assert.deepEqual(await snapshot(repository.root), before);
}

function summaryEntry(report) {
  return {
    result: report.metadata.result,
    attempt: report.metadata.attempt,
    report: report.path,
    revision: report.metadata.revision,
  };
}

async function projectFixture(t, work = "feature") {
  const repository = await fixture(t, { withTask: false });
  const session = `projects/tasks/${work}/sessions/${run}`;
  const task = `projects/tasks/${work}/work-items/task.md`;
  const evidence = `${session}/evidence/snapshot.patch`;
  const artifact = `${session}/evidence/check.log`;
  await repository.put(task, "# Project task — status: in-progress\n");
  await repository.put(evidence, "Verified project snapshot.\n");
  await repository.put(artifact, "Project checks passed.\n");
  async function report(overrides = {}, options = {}) {
    const value = metadata({
      task,
      revision: { commit: "a".repeat(40), dirty: true, evidence: [evidence] },
      artifacts: [artifact],
      ...overrides,
    });
    return repository.report(value, {
      path: `${session}/results/${value.role}-${value.attempt}.md`,
      ...options,
    });
  }
  return { ...repository, session, task, report };
}

test("projects: check and summary accept work-owned reports and preserve canonical inputs", async (t) => {
  const f = await projectFixture(t);
  await f.report({ role: "developer" });
  await f.report({ role: "reviewer" });
  const before = await snapshot(f.root);
  const reports = await loadResults([f.session], { root: f.root });
  assert.equal(reports.length, 2);
  assert.ok(reports.every((report) => report.taskStatus === "in-progress"));
  const summary = buildSummary(reports);
  assert.equal(summary.tasks.length, 1);
  assert.equal(summary.tasks[0].task, f.task);
  assert.equal(summary.tasks[0].task_status, "in-progress");
  const output = `${f.session}/summary.yaml`;
  await writeSummary(summary, output, { root: f.root });
  await writeSummary(summary, output, { root: f.root });
  assert.deepEqual(parse(await readFile(path.join(f.root, output), "utf8")), summary);
  assert.deepEqual((await snapshot(f.root)).filter(([name]) => name !== output), before);
});

test("projects: report cannot claim a task from another work or a legacy task", async (t) => {
  for (const foreign of ["projects/tasks/other/work-items/task.md", taskPath]) {
    await t.test(foreign, async (t) => {
      const f = await projectFixture(t);
      await f.put(foreign, "# Foreign task — status: done\n");
      const report = await f.report({ task: foreign });
      const before = await snapshot(f.root);
      await assert.rejects(() => loadResults([report.path], { root: f.root }));
      assert.deepEqual(await snapshot(f.root), before);
    });
  }
});

test("projects: same-run intake reports remain separate across work owners", async (t) => {
  const f = await projectFixture(t, "first");
  await f.report({ task: null, role: "supervisor" });
  const second = `projects/tasks/second/sessions/${run}`;
  await f.put(`${second}/results/supervisor-0.md`, reportSource(metadata({
    task: null,
    role: "supervisor",
  })));
  const before = await snapshot(f.root);
  const reports = await loadResults([f.session, second], { root: f.root });
  const summary = buildSummary(reports);
  assert.equal(summary.tasks.length, 2);
  assert.ok(summary.tasks.every((entry) => entry.task === null));
  assert.deepEqual(new Set(summary.tasks.map((entry) => entry.reports.supervisor.report)), new Set([
    `${f.session}/results/supervisor-0.md`,
    `${second}/results/supervisor-0.md`,
  ]));
  await assert.rejects(() => writeSummary(summary, `${f.session}/summary.yaml`, { root: f.root }));
  assert.deepEqual(await snapshot(f.root), before);
});

test("projects: summary cannot be saved to another work with the same run", async (t) => {
  const f = await projectFixture(t);
  await f.report();
  const summary = buildSummary(await loadResults([f.session], { root: f.root }));
  const foreign = `projects/tasks/other/sessions/${run}/summary.yaml`;
  await f.put(foreign, "unrelated: true\n");
  const before = await snapshot(f.root);
  await assert.rejects(() => writeSummary(summary, foreign, { root: f.root }));
  assert.deepEqual(await snapshot(f.root), before);
});

test("projects: report location must match the exact run and results directory", async (t) => {
  for (const relative of [
    `projects/tasks/feature/sessions/${run}/extra/results/tester-0.md`,
    `projects/tasks/feature/sessions/${run}-other/results/tester-0.md`,
    `projects/tasks/feature/sessions/${run}/assignments/tester-0.md`,
    `projects/tasks/feature-suffix/invalid/sessions/${run}/results/tester-0.md`,
  ]) {
    await t.test(relative, async (t) => {
      const f = await projectFixture(t);
      const report = await f.report({}, { path: relative });
      await assert.rejects(() => loadResults([report.path], { root: f.root }));
    });
  }
});

test("projects: existing targets do not make traversal references valid", async (t) => {
  const f = await projectFixture(t);
  const report = await f.report({ task: "projects/tasks/feature/work-items/../work-items/task.md" });
  const before = await snapshot(f.root);
  await assert.rejects(() => loadResults([report.path], { root: f.root }));
  assert.deepEqual(await snapshot(f.root), before);
});

test("projects: escaped results junction is refused without touching its target", async (t) => {
  const f = await projectFixture(t);
  const foreign = path.join(f.root, "foreign-results");
  await mkdir(foreign);
  await writeFile(path.join(foreign, "tester-0.md"), reportSource(metadata({ task: f.task })));
  const link = path.join(f.root, f.session, "results");
  await symlink(foreign, link, "junction");
  await assert.rejects(() => loadResults([f.session], { root: f.root }));
  assert.deepEqual(await readdir(foreign), ["tester-0.md"]);
});

test("loads real YAML with multiline checks, BOM and CRLF without changing input files", async (t) => {
  const repository = await fixture(t);
  const value = metadata({
    checks: [
      {
        name: "Command output\nwith a second line",
        result: "pass",
        command: "node --test\nnode --version\n",
        exit_code: 0,
      },
    ],
  });
  const source =
    `\uFEFF${reportSource(value, "# Проверка\n\nПодтверждение результата.\n")}`.replaceAll(
      "\n",
      "\r\n",
    );
  assert.match(source, /command: \|/);
  const report = await repository.report(value, { source });
  const before = await snapshot(repository.root);

  const reports = await loadResults([report.path], { root: repository.root });

  assert.deepEqual(reports, [{ ...report, taskStatus: "in-progress" }]);
  assert.deepEqual(await snapshot(repository.root), before);
});

test("all five roles are accepted and summary keeps the canonical task status", async (t) => {
  const repository = await fixture(t);
  const expected = [];
  for (const role of roles) expected.push(await repository.report({ role }));
  const before = await snapshot(repository.root);
  const reports = await loadResults([sessionPath], { root: repository.root });

  assert.deepEqual(
    reports.map((report) => report.metadata.role).sort(),
    [...roles].sort(),
  );
  const expectedRoles = Object.fromEntries(
    expected.map((report) => [report.metadata.role, summaryEntry(report)]),
  );
  const input = structuredClone(reports);
  assert.deepEqual(buildSummary(reports), {
    schema_version: 1,
    kind: "agent-summary",
    tasks: [
      {
        task: taskPath,
        run,
        task_status: "in-progress",
        reports: expectedRoles,
        missing_roles: [],
      },
    ],
  });
  assert.deepEqual(reports, input);
  assert.deepEqual(await snapshot(repository.root), before);
});

test("four-role history stays readable with reviewer missing without changing historical reports", async (t) => {
  const repository = await fixture(t);
  const expected = [];
  for (const role of ["supervisor", "spec-writer", "developer", "tester"]) {
    expected.push(await repository.report({ role }));
  }
  const before = await snapshot(repository.root);

  const reports = await loadResults([sessionPath], { root: repository.root });

  assert.equal(reports.length, 4);
  assert.deepEqual(buildSummary(reports), {
    schema_version: 1,
    kind: "agent-summary",
    tasks: [
      {
        task: taskPath,
        run,
        task_status: "in-progress",
        reports: {
          ...Object.fromEntries(
            expected.map((report) => [report.metadata.role, summaryEntry(report)]),
          ),
          reviewer: null,
        },
        missing_roles: ["reviewer"],
      },
    ],
  });
  assert.deepEqual(await snapshot(repository.root), before);
});

test("intake accepts task null for supervisor and spec-writer without creating a task", async (t) => {
  const repository = await fixture(t, { withTask: false });
  const supervisor = await repository.report({
    role: "supervisor",
    task: null,
  });
  const writer = await repository.report({ role: "spec-writer", task: null });
  const before = await snapshot(repository.root);
  const reports = await loadResults([sessionPath], { root: repository.root });

  assert.ok(reports.every((report) => report.taskStatus === null));
  assert.deepEqual(buildSummary(reports), {
    schema_version: 1,
    kind: "agent-summary",
    tasks: [
      {
        task: null,
        run,
        task_status: null,
        reports: {
          supervisor: summaryEntry(supervisor),
          "spec-writer": summaryEntry(writer),
          developer: null,
          tester: null,
          reviewer: null,
        },
        missing_roles: ["developer", "tester", "reviewer"],
      },
    ],
  });
  assert.deepEqual(await snapshot(repository.root), before);
});

test("rejects malformed metadata that could be mistaken for an accepted report", async (t) => {
  const cases = [
    ["unknown role", { role: "unknown" }],
    ["unknown top-level field", { accepted: true }],
    [
      "unknown nested field",
      { revision: { ...metadata().revision, accepted: true } },
    ],
    ["wrong type", { attempt: "1" }],
    ["unsupported version", { schema_version: 2 }],
    ["wrong kind", { kind: "agent-summary" }],
    ["attempt beyond retry limit", { attempt: 4 }],
    ["developer without task", { role: "developer", task: null }],
    ["tester without task", { task: null }],
    ["reviewer without task", { role: "reviewer", task: null }],
    [
      "dirty revision without evidence",
      { revision: { ...metadata().revision, evidence: [] } },
    ],
    ["no checks", { checks: [] }],
  ];
  for (const [name, overrides] of cases) {
    await t.test(name, (t) => expectRejectedReport(t, overrides));
  }
});

test("explicit report paths require unique YAML frontmatter and a meaningful body", async (t) => {
  const valid = reportSource(metadata());
  const cases = [
    ["missing frontmatter", "# Legacy report\n\nNo metadata.\n"],
    ["unterminated frontmatter", `---\n${stringify(metadata())}\n# Body\n`],
    [
      "duplicate YAML key",
      valid.replace("result: pass", "result: fail\nresult: pass"),
    ],
    ["empty body", reportSource(metadata(), "")],
    ["whitespace body", reportSource(metadata(), " \r\n\t\r\n")],
  ];
  for (const [name, source] of cases) {
    await t.test(name, (t) => expectRejectedReport(t, {}, { source }));
  }
});

test("rejects false pass, inconsistent overall results and unexplained blockers", async (t) => {
  const cases = [
    [
      "pass hides a failed check",
      { checks: [{ name: "Acceptance", result: "fail" }] },
    ],
    [
      "pass hides a blocker",
      {
        checks: [
          {
            name: "Acceptance",
            result: "blocked",
            reason: "Service unavailable",
          },
        ],
      },
    ],
    [
      "blocked hides a failed check",
      { result: "blocked", checks: [{ name: "Acceptance", result: "fail" }] },
    ],
    ["fail has only passing checks", { result: "fail" }],
    ["blocked has only passing checks", { result: "blocked" }],
    [
      "passing command failed",
      {
        checks: [
          {
            name: "Command",
            command: "node --test",
            result: "pass",
            exit_code: 1,
          },
        ],
      },
    ],
    [
      "passing command has no exit code",
      { checks: [{ name: "Command", command: "node --test", result: "pass" }] },
    ],
    [
      "passing command has null exit code",
      {
        checks: [
          {
            name: "Command",
            command: "node --test",
            result: "pass",
            exit_code: null,
          },
        ],
      },
    ],
    [
      "blocked check has no reason",
      { result: "blocked", checks: [{ name: "Service", result: "blocked" }] },
    ],
  ];
  for (const [name, overrides] of cases) {
    await t.test(name, (t) => expectRejectedReport(t, overrides));
  }
});

test("valid fail and blocked results remain valid reports without becoming task completion", async (t) => {
  const repository = await fixture(t);
  const failed = await repository.report({
    result: "fail",
    checks: [
      {
        name: "Failed command",
        result: "fail",
        command: "node --test",
        exit_code: 1,
      },
      {
        name: "Unavailable service",
        result: "blocked",
        reason: "Service unavailable",
      },
    ],
  });
  const blocked = await repository.report({
    role: "developer",
    result: "blocked",
    checks: [
      {
        name: "Unavailable service",
        result: "blocked",
        reason: "Service unavailable",
      },
    ],
  });

  const reports = await loadResults([failed.path, blocked.path], {
    root: repository.root,
  });

  assert.deepEqual(
    Object.fromEntries(
      reports.map((report) => [report.metadata.role, report.metadata.result]),
    ),
    {
      tester: "fail",
      developer: "blocked",
    },
  );
  assert.equal(buildSummary(reports).tasks[0].task_status, "in-progress");
});

test("rejects missing task, artifact and revision evidence files", async (t) => {
  const cases = [
    ["task", { task: ".agents/project/tasks/feature/missing.md" }],
    [
      "reviewer task",
      { role: "reviewer", task: ".agents/project/tasks/feature/missing.md" },
    ],
    ["artifact", { artifacts: [`${sessionPath}/evidence/missing.log`] }],
    [
      "evidence",
      {
        revision: {
          ...metadata().revision,
          evidence: [`${sessionPath}/evidence/missing.patch`],
        },
      },
    ],
    ["directory as artifact", { artifacts: [`${sessionPath}/evidence`] }],
  ];
  for (const [name, overrides] of cases) {
    await t.test(name, (t) => expectRejectedReport(t, overrides));
  }
});

test("rejects traversal and absolute references even when their target exists", async (t) => {
  for (const field of ["task", "artifact", "evidence"]) {
    for (const form of ["traversal", "absolute", "backslash"]) {
      await t.test(`${field}: ${form}`, async (t) => {
        const repository = await fixture(t);
        const original = field === "task" ? taskPath : evidencePath;
        const reference =
          form === "absolute"
            ? path.resolve(repository.root, original).replaceAll("\\", "/")
            : form === "backslash"
              ? original.replaceAll("/", "\\")
              : original.replace("/project/", "/project/../project/");
        const overrides =
          field === "task"
            ? { task: reference }
            : field === "artifact"
              ? { artifacts: [reference] }
              : field === "evidence"
                ? {
                    revision: { ...metadata().revision, evidence: [reference] },
                  }
                : {};
        const report = await repository.report(overrides);
        const before = await snapshot(repository.root);

        await assert.rejects(() =>
          loadResults([report.path], { root: repository.root }),
        );
        assert.deepEqual(await snapshot(repository.root), before);
      });
    }
  }
});

test("absolute report input inside root is accepted and returned as a relative path", async (t) => {
  const repository = await fixture(t);
  const report = await repository.report();
  const before = await snapshot(repository.root);
  const reports = await loadResults(
    [path.resolve(repository.root, report.path)],
    { root: repository.root },
  );
  assert.deepEqual(reports, [{ ...report, taskStatus: "in-progress" }]);
  assert.deepEqual(await snapshot(repository.root), before);
});

test("report location must belong to metadata run and its results directory", async (t) => {
  for (const reportPath of [
    ".agents/project/sessions/other-run/results/tester-0.md",
    `${sessionPath}/assignments/tester-0.md`,
    `${sessionPath}/tester-0.md`,
  ]) {
    await t.test(reportPath, (t) =>
      expectRejectedReport(t, {}, { path: reportPath }),
    );
  }
});

test("rejects distinct files with the same role/task/attempt/run tuple", async (t) => {
  const repository = await fixture(t);
  const first = await repository.report();
  const second = await repository.report(
    {},
    { path: `${resultsPath}/copied-report.md` },
  );
  await assert.rejects(() =>
    loadResults([first.path, second.path], { root: repository.root }),
  );
});

test("directory discovery ignores legacy documents and assignments but validates every result", async (t) => {
  const repository = await fixture(t);
  const report = await repository.report();
  await repository.put(
    `${sessionPath}/legacy.md`,
    "# Old report\n\nPreserved history.\n",
  );
  await repository.put(
    `${sessionPath}/assignments/tester-0.md`,
    reportSource(metadata({ role: "unknown" })),
  );
  const reports = await loadResults([sessionPath], { root: repository.root });
  assert.deepEqual(reports, [{ ...report, taskStatus: "in-progress" }]);

  await repository.put(
    `${resultsPath}/invalid.md`,
    reportSource(metadata({ role: "unknown" })),
  );
  await assert.rejects(() =>
    loadResults([sessionPath], { root: repository.root }),
  );
});

test("rejects empty, missing and legacy-only inputs instead of claiming successful validation", async (t) => {
  const repository = await fixture(t);
  await repository.put(`${sessionPath}/legacy.md`, "# Legacy report\n");
  for (const inputs of [
    [],
    [""],
    [`${sessionPath}/missing.md`],
    [sessionPath],
  ]) {
    await t.test(JSON.stringify(inputs), async () => {
      await assert.rejects(() =>
        loadResults(inputs, { root: repository.root }),
      );
    });
  }
});

test("summary selects latest attempts per task and run independent of input ordering", async (t) => {
  const repository = await fixture(t);
  const older = await repository.report({ attempt: 0 });
  const latest = await repository.report({
    attempt: 3,
    result: "fail",
    checks: [{ name: "Regression", result: "fail" }],
  });
  const otherRun = await repository.report({ run: "second-run", attempt: 1 });
  const otherTaskPath = ".agents/project/tasks/feature/second-task.md";
  await repository.put(otherTaskPath, "# Second task — status: in-progress\n");
  const otherTask = await repository.report({
    role: "developer",
    task: otherTaskPath,
  });
  const reports = await loadResults(
    [latest.path, otherRun.path, older.path, otherTask.path],
    { root: repository.root },
  );
  const original = structuredClone(reports);
  const summary = buildSummary(reports);
  assert.equal(summary.schema_version, 1);
  assert.equal(summary.kind, "agent-summary");
  assert.equal(summary.tasks.length, 3);
  for (const [report, role] of [
    [latest, "tester"],
    [otherRun, "tester"],
    [otherTask, "developer"],
  ]) {
    const task = summary.tasks.find(
      (entry) =>
        entry.task === report.metadata.task &&
        entry.run === report.metadata.run,
    );
    assert.ok(task);
    assert.equal(task.task_status, "in-progress");
    assert.deepEqual(
      task.reports,
      Object.fromEntries(
        roles.map((candidate) => [
          candidate,
          candidate === role ? summaryEntry(report) : null,
        ]),
      ),
    );
    assert.deepEqual(
      task.missing_roles,
      roles.filter((candidate) => candidate !== role),
    );
  }
  assert.deepEqual(buildSummary([...reports].reverse()), summary);
  assert.deepEqual(reports, original);
});

test("writeSummary writes only session summary YAML and permits regenerating its own output", async (t) => {
  const repository = await fixture(t);
  await repository.report();
  const summary = buildSummary(
    await loadResults([sessionPath], { root: repository.root }),
  );
  const before = await snapshot(repository.root);

  await writeSummary(summary, summaryPath, { root: repository.root });

  assert.deepEqual(
    parse(await readFile(path.join(repository.root, summaryPath), "utf8")),
    summary,
  );
  assert.deepEqual(
    (await snapshot(repository.root)).filter(([name]) => name !== summaryPath),
    before,
  );
  const reports = await loadResults([sessionPath], { root: repository.root });
  assert.equal(reports.length, 1);
  await writeSummary(buildSummary(reports), summaryPath, {
    root: repository.root,
  });
  assert.deepEqual(
    parse(await readFile(path.join(repository.root, summaryPath), "utf8")),
    summary,
  );
  assert.deepEqual(
    (await snapshot(repository.root)).filter(([name]) => name !== summaryPath),
    before,
  );
});

test("writeSummary rejects dangerous destinations without changing files or creating directories", async (t) => {
  const destinations = [
    ["canonical task", taskPath],
    ["input report", `${resultsPath}/tester-0.md`],
    ["arbitrary YAML", `${sessionPath}/custom.yaml`],
    ["incompatible run", ".agents/project/sessions/not-this-run/summary.yaml"],
    ["traversal", `${sessionPath}/../${run}/summary.yaml`],
    ["absolute", null],
  ];
  for (const [name, output] of destinations) {
    await t.test(name, async (t) => {
      const repository = await fixture(t);
      await repository.report();
      const summary = buildSummary(
        await loadResults([sessionPath], { root: repository.root }),
      );
      const before = await snapshot(repository.root);
      const destination =
        output ??
        path.resolve(repository.root, summaryPath).replaceAll("\\", "/");
      await assert.rejects(() =>
        writeSummary(summary, destination, { root: repository.root }),
      );
      assert.deepEqual(await snapshot(repository.root), before);
    });
  }
});

test("writeSummary preserves unrelated existing YAML and incompatible existing summaries", async (t) => {
  const contents = [
    "owner: another-tool\nvalue: preserve-me\n",
    "schema_version: 1\nkind: agent-summary\ntasks:\n  - task: null\n    run: another-run\n",
  ];
  for (const content of contents) {
    await t.test(content.split("\n")[0], async (t) => {
      const repository = await fixture(t);
      await repository.report();
      const summary = buildSummary(
        await loadResults([sessionPath], { root: repository.root }),
      );
      await repository.put(summaryPath, content);
      const before = await snapshot(repository.root);
      await assert.rejects(() =>
        writeSummary(summary, summaryPath, { root: repository.root }),
      );
      assert.deepEqual(await snapshot(repository.root), before);
    });
  }
});

test("writeSummary rejects a summary containing a different run before writing anything", async (t) => {
  const repository = await fixture(t);
  const first = await repository.report();
  const second = await repository.report({ run: "second-run" });
  const summary = buildSummary(
    await loadResults([first.path, second.path], { root: repository.root }),
  );
  const before = await snapshot(repository.root);
  await assert.rejects(() =>
    writeSummary(summary, summaryPath, { root: repository.root }),
  );
  assert.deepEqual(await snapshot(repository.root), before);
});

test("CLI help and invalid arguments have useful exit codes without writes", () => {
  const cliPath = fileURLToPath(
    new URL("../../supervisor/scripts/agent-results-cli.mjs", import.meta.url),
  );
  const help = spawnSync(process.execPath, [cliPath, "--help"], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.ifError(help.error);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /check|validate/i);
  assert.match(help.stdout, /summary/i);
  const invalid = spawnSync(process.execPath, [cliPath, "--unknown-option"], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.ifError(invalid.error);
  assert.ok(Number.isInteger(invalid.status) && invalid.status !== 0);
  assert.match(
    `${invalid.stderr}${invalid.stdout}`,
    /usage|unknown|invalid|error/i,
  );
});

test("CLI check exits zero for valid fail and blocked reports without changing task status", async (t) => {
  const repository = await fixture(t);
  // Неизменённые копии сохраняют вычисление repositoryRoot самим CLI внутри fixture.
  for (const relativePath of [
    ".agents/supervisor/scripts/agent-results.mjs",
    ".agents/supervisor/scripts/agent-results-cli.mjs",
    ".agents/supervisor/schemas/agent-result.schema.json",
  ]) {
    await repository.put(
      relativePath,
      await readFile(path.join(repoRoot, relativePath)),
    );
  }
  const failed = await repository.report({
    result: "fail",
    checks: [
      {
        name: "Acceptance check",
        result: "fail",
        command: "node --test",
        exit_code: 1,
      },
    ],
  });
  const blocked = await repository.report({
    role: "developer",
    result: "blocked",
    checks: [
      {
        name: "Service check",
        result: "blocked",
        reason: "Service unavailable",
      },
    ],
  });
  const before = await snapshot(repository.root);
  const dependencyLink = path.join(repository.root, "node_modules");
  await symlink(
    path.join(repoRoot, "node_modules"),
    dependencyLink,
    process.platform === "win32" ? "junction" : "dir",
  );
  try {
    for (const report of [failed, blocked]) {
      const result = spawnSync(
        process.execPath,
        [
          ".agents/supervisor/scripts/agent-results-cli.mjs",
          "check",
          report.path,
        ],
        { cwd: repository.root, encoding: "utf8", timeout: 10_000 },
      );
      assert.ifError(result.error);
      assert.equal(
        result.status,
        0,
        `${report.metadata.result}: ${result.stderr}`,
      );
      assert.match(result.stdout, /validated\s+1/i);
    }
  } finally {
    // Сначала снимаем ссылку на зависимости, затем fixture очищает свой временный root.
    await unlink(dependencyLink);
  }
  assert.deepEqual(await snapshot(repository.root), before);
});
