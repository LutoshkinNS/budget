import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFile,
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const cli = path.join(
  repository,
  ".agents/supervisor/scripts/agent-tokens-cli.mjs",
);
const temporaryParent = path.join(
  repository,
  ".agents/project/sessions/2026-10-19-token-accounting/repro",
);
const session = ".agents/project/sessions/fixture-run";
const taskPath = ".agents/project/tasks/feature/task.md";
const secondTask = ".agents/project/tasks/feature/second.md";
const secret = "PRIVATE_SYNTHETIC_MESSAGE_DO_NOT_COPY";
const timestamp = "2026-10-19T17:00:00.000Z";

function event(type, payload) {
  return { timestamp, type, payload };
}
function context(turn, model = "model-a") {
  return event("turn_context", { turn_id: turn, model });
}
function usage(input = 100, output = 10, subsets = {}) {
  return {
    input_tokens: input,
    output_tokens: output,
    total_tokens: input + output,
    cached_input_tokens: 0,
    cache_write_input_tokens: 0,
    reasoning_output_tokens: 0,
    ...subsets,
  };
}
function record(thread, response, value = usage(), options = {}) {
  return {
    ...event("token_usage_record", {
      thread_id: thread,
      turn_id: options.turn ?? "turn-a",
      session_id: `session-${thread}`,
      root_turn_id: options.turn ?? "turn-a",
      response_id: response,
      usage: value,
      turn_token_usage: options.cumulative ?? value,
      thread_token_usage: options.cumulative ?? value,
    }),
    ordinal: options.ordinal ?? 4,
  };
}
function legacy(value) {
  return event("event_msg", {
    type: "token_count",
    info:
      value === null
        ? null
        : {
            total_token_usage: value,
            last_token_usage: value,
            model_context_window: 200000,
          },
  });
}
function lines(events) {
  return events.map((value) => JSON.stringify(value)).join("\n") + "\n";
}
function codes(report) {
  return report.diagnostics.map((value) => value.code);
}
function hasCode(report, code) {
  assert.ok(codes(report).includes(code), JSON.stringify(report.diagnostics));
}
function total(report, expected) {
  assert.equal(report.observed_usage.total_tokens, expected);
}
function incomplete(report) {
  assert.notEqual(report.completeness, "complete");
}
function rows(report, selector) {
  return report.rows.filter(selector);
}

async function fixture(t) {
  await mkdir(temporaryParent, { recursive: true });
  const root = await mkdtemp(path.join(temporaryParent, "tokens-"));
  t.after(async () => {
    // Проверка ограничивает рекурсивную очистку каталогом, созданным этой fixture.
    assert.equal(
      path.dirname(path.resolve(root)),
      path.resolve(temporaryParent),
    );
    assert.ok(path.basename(root).startsWith("tokens-"));
    await rm(root, { recursive: true, force: true });
  });
  const sessionsRoot = path.join(root, "input-sessions");
  async function put(relative, text) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, text);
    return target;
  }
  await put(taskPath, "# Task — status: in-progress\n\nFixture task.\n");
  await put(secondTask, "# Second — status: done\n");
  await mkdir(path.join(root, session), { recursive: true });
  await mkdir(sessionsRoot, { recursive: true });
  async function source(id, events = [], metadata = {}) {
    return put(
      `input-sessions/${id}.jsonl`,
      lines([
        event("session_meta", {
          id,
          timestamp,
          cli_version: "0.163.0",
          history_mode: "paginated",
          ...metadata,
        }),
        ...events,
      ]),
    );
  }
  function call(command, args = [], { status = 0, run = session } = {}) {
    const result = spawnSync(
      process.execPath,
      [cli, command, run, ...args, "--sessions-root", sessionsRoot],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, CODEX_THREAD_ID: "must-not-be-used" },
        timeout: 20000,
      },
    );
    assert.equal(
      result.status,
      status,
      `${command} ${args.join(" ")}\n${result.stderr}\n${result.stdout}`,
    );
    assert.ok(!`${result.stdout}${result.stderr}`.includes(secret));
    return result;
  }
  function start(thread = "parent", options) {
    return call("start", ["--task", taskPath, "--thread", thread], options);
  }
  function attach(
    thread,
    { task = taskPath, role = "developer", attempt = 0, fromStart = true } = {},
    options,
  ) {
    return call(
      "attach",
      [
        "--task",
        task,
        "--thread",
        thread,
        "--role",
        role,
        "--attempt",
        String(attempt),
        ...(fromStart ? ["--from-start"] : []),
      ],
      options,
    );
  }
  function stop(thread = "parent", options) {
    return call("stop", ["--thread", thread], options);
  }
  function report() {
    return JSON.parse(call("report").stdout);
  }
  async function append(id, events) {
    await appendFile(path.join(sessionsRoot, `${id}.jsonl`), lines(events));
  }
  async function manifest() {
    return readFile(path.join(root, session, "token-manifest.json"), "utf8");
  }
  return {
    root,
    sessionsRoot,
    put,
    source,
    call,
    start,
    attach,
    stop,
    report,
    append,
    manifest,
  };
}

async function digestTree(directory) {
  const result = {};
  async function visit(current, prefix = "") {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(target, `${relative}/`);
      else if (entry.isFile())
        result[relative] = createHash("sha256")
          .update(await readFile(target))
          .digest("hex");
    }
  }
  await visit(directory);
  return result;
}

test("AC-1/8: lifecycle sums own parent and child responses and leaves inputs unchanged", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  await f.source(
    "child",
    [
      context("turn-a"),
      record(
        "child",
        "child-response",
        usage(50, 5, { reasoning_output_tokens: 2 }),
      ),
    ],
    { parent_thread_id: "parent" },
  );
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "parent-response"),
  ]);
  f.attach("child");
  f.stop("child");
  f.stop();
  const before = await digestTree(f.root);
  const report = f.report();
  total(report, 165);
  assert.equal(report.kind, "task-token-report");
  assert.equal(report.schema_version, 1);
  assert.equal(report.run, "fixture-run");
  assert.equal(report.completeness, "complete");
  assert.equal(report.provisional, false);
  assert.equal(
    rows(report, (row) => row.role === "supervisor")[0].observed_usage
      .total_tokens,
    110,
  );
  assert.equal(
    rows(report, (row) => row.role === "developer")[0].observed_usage
      .total_tokens,
    55,
  );
  assert.equal(report.tasks[0].task_status, "in-progress");
  assert.deepEqual(await digestTree(f.root), before);
  const repeated = f.report();
  const { captured_at: firstCapture, ...first } = report;
  const { captured_at: secondCapture, ...second } = repeated;
  assert.ok(firstCapture && secondCapture);
  assert.deepEqual(second, first);
  const markdown = f.call("report", ["--format", "markdown"]).stdout;
  assert.match(markdown, /165/);
  assert.match(markdown, /supervisor/);
  assert.match(markdown, /developer/);
  assert.match(markdown, /[А-Яа-яЁё]/u);
  assert.deepEqual(await digestTree(f.root), before);
});

test("AC-2: checkpoint excludes prehistory; gap is unassigned; tasks and attempts remain separate", async (t) => {
  const f = await fixture(t);
  await f.source("parent", [
    context("turn-a"),
    record("parent", "before", usage(900, 90)),
  ]);
  f.start();
  await f.append("parent", [
    record("parent", "first", usage(100, 10), { cumulative: usage(1000, 100) }),
  ]);
  f.stop();
  const closedManifest = await f.manifest();
  await f.append("parent", [
    record("parent", "gap", usage(18, 2), { cumulative: usage(1018, 102) }),
  ]);
  f.stop();
  assert.equal(await f.manifest(), closedManifest);
  total(f.report(), 110);
  f.attach("parent", {
    task: secondTask,
    role: "reviewer",
    attempt: 1,
    fromStart: false,
  });
  await f.append("parent", [
    record("parent", "second", usage(50, 5), { cumulative: usage(1068, 107) }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 185);
  assert.equal(report.unassigned_usage.total_tokens, 20);
  assert.equal(
    rows(report, (row) => row.task === taskPath && row.attempt === 0)[0]
      .observed_usage.total_tokens,
    110,
  );
  assert.equal(
    rows(report, (row) => row.task === secondTask && row.attempt === 1)[0]
      .observed_usage.total_tokens,
    55,
  );
  assert.equal(
    report.tasks.find((value) => value.task === secondTask).task_status,
    "done",
  );
  const before = await f.manifest();
  f.attach("parent", { attempt: 2 }, { status: 1 });
  assert.equal(await f.manifest(), before);
});

test("AC-2/7: overlap, duplicate start and invalid arguments cannot mutate manifest", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  const before = await f.manifest();
  f.start("parent", { status: 1 });
  f.attach("parent", { task: secondTask, fromStart: false }, { status: 1 });
  f.attach("parent", { attempt: 4 }, { status: 1 });
  f.attach("parent", { attempt: 1.5 }, { status: 1 });
  f.attach("parent", { role: "invented" }, { status: 1 });
  f.call("stop", ["--thread", "unknown"], { status: 1 });
  assert.equal(await f.manifest(), before);
});

test("AC-3: identical response records and foreign inherited history never add tokens", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  const parent = record("parent", "same-response");
  await f.append("parent", [context("turn-a"), parent, parent]);
  await f.source(
    "child",
    [
      context("turn-a"),
      parent,
      record("unattached-foreign", "foreign-only", usage(9000, 900)),
      record("child", "own-child", usage(50, 5)),
    ],
    { parent_thread_id: "parent" },
  );
  f.attach("child");
  f.stop("child");
  f.stop();
  const report = f.report();
  total(report, 165);
  assert.equal(
    rows(report, (row) => row.role === "developer")[0].observed_usage
      .total_tokens,
    55,
  );
});

for (const ownerConflict of [false, true]) {
  test(`AC-3: response conflict (${ownerConflict ? "different owner" : "different usage"}) excludes all conflicting records`, async (t) => {
    const f = await fixture(t);
    await f.source("parent");
    f.start();
    await f.append("parent", [context("turn-a"), record("parent", "conflict")]);
    await f.source(
      "child",
      [
        context("turn-a"),
        record("child", ownerConflict ? "conflict" : "safe", usage(50, 5)),
      ],
      { parent_thread_id: "parent" },
    );
    if (!ownerConflict)
      await f.append("parent", [record("parent", "conflict", usage(101, 10))]);
    f.attach("child");
    f.stop("child");
    f.stop();
    const report = f.report();
    total(report, ownerConflict ? 0 : 55);
    hasCode(report, "response_conflict");
    assert.equal(report.completeness, "unknown");
  });
}

test("AC-5: model is preceding context of the same turn; cache and reasoning are subsets", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a", "model-a"),
    record(
      "parent",
      "a",
      usage(100, 10, {
        cached_input_tokens: 60,
        cache_write_input_tokens: 7,
        reasoning_output_tokens: 4,
      }),
    ),
    context("turn-a", "model-b"),
    record(
      "parent",
      "b",
      usage(50, 5, { cached_input_tokens: 20, reasoning_output_tokens: 2 }),
      { cumulative: usage(150, 15) },
    ),
    record("parent", "unknown-model", usage(20, 2), {
      turn: "another-turn",
      cumulative: usage(170, 17),
    }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 187);
  assert.equal(report.observed_usage.cached_input_tokens, 80);
  assert.equal(report.observed_usage.cache_write_input_tokens, 7);
  assert.equal(report.observed_usage.reasoning_output_tokens, 6);
  assert.equal(
    rows(report, (row) => row.model === "model-a")[0].observed_usage
      .total_tokens,
    110,
  );
  assert.equal(
    rows(report, (row) => row.model === "model-b")[0].observed_usage
      .total_tokens,
    55,
  );
  assert.equal(
    rows(report, (row) => row.model === null)[0].observed_usage.total_tokens,
    22,
  );
  hasCode(report, "missing_model");
  incomplete(report);
});

test("AC-5: absent optional counters remain unknown rather than zero", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "minimal", {
      input_tokens: 100,
      output_tokens: 10,
      total_tokens: 110,
    }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 110);
  for (const field of [
    "cached_input_tokens",
    "cache_write_input_tokens",
    "reasoning_output_tokens",
  ]) {
    assert.equal(report.observed_usage[field], null);
    assert.equal(report.rows[0].observed_usage[field], null);
  }
});

test("AC-5: modern anonymized intake example uses usage only, not cumulative sums", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record(
      "parent",
      "sample",
      usage(23162, 256, { cached_input_tokens: 7168 }),
    ),
  ]);
  f.stop();
  const report = f.report();
  total(report, 23418);
  assert.equal(report.observed_usage.cached_input_tokens, 7168);
});

for (const invalid of [
  null,
  usage(-1, 10),
  usage(100, 10, { total_tokens: 999 }),
  usage(100, 10, { cached_input_tokens: 101 }),
  usage(100, 10, { reasoning_output_tokens: 11 }),
  usage(0.5, 10),
  usage(Number.MAX_SAFE_INTEGER + 1, 0),
]) {
  test(`AC-4/5: invalid usage ${JSON.stringify(invalid)} is excluded with diagnostics`, async (t) => {
    const f = await fixture(t);
    await f.source("parent");
    f.start();
    await f.append("parent", [
      context("turn-a"),
      record("parent", "bad", invalid),
      record("parent", "good", usage(50, 5)),
    ]);
    f.stop();
    const report = f.report();
    total(report, 55);
    incomplete(report);
    assert.ok(report.diagnostics.length > 0);
  });
}

test("AC-4: legacy cumulative, repeated counters and null info are never numeric fallback", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    legacy(null),
    legacy(usage(900, 100)),
    legacy(usage(900, 100)),
  ]);
  f.stop();
  const report = f.report();
  total(report, 0);
  incomplete(report);
  hasCode(report, "legacy_without_records");
});

test("AC-4: malformed complete line keeps valid records and never echoes raw text", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [context("turn-a"), record("parent", "good")]);
  await appendFile(
    path.join(f.sessionsRoot, "parent.jsonl"),
    `{BROKEN_${secret}\n`,
  );
  f.stop();
  const report = f.report();
  total(report, 110);
  incomplete(report);
  assert.ok(report.diagnostics.some((value) => Number.isInteger(value.line)));
});

test("AC-4: an unfinished JSON line is provisional and counted once after its newline arrives", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [context("turn-a")]);
  await appendFile(
    path.join(f.sessionsRoot, "parent.jsonl"),
    JSON.stringify(record("parent", "tail")),
  );
  const first = f.report();
  total(first, 0);
  assert.equal(first.provisional, true);
  incomplete(first);
  await appendFile(path.join(f.sessionsRoot, "parent.jsonl"), "\n");
  f.stop();
  total(f.report(), 110);
});

test("AC-4: compaction and lagging token_count do not reset own record sum", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "first"),
    legacy(usage()),
    event("compacted", { message: secret }),
    record("parent", "second", usage(50, 5), { cumulative: usage(150, 15) }),
    legacy(usage()),
  ]);
  f.stop();
  const report = f.report();
  total(report, 165);
  assert.equal(report.completeness, "complete");
});

test("AC-4: record cumulative coverage gap and reset preserve observed values and diagnostics", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "gap", usage(), { cumulative: usage(1000, 100) }),
    record("parent", "reset", usage(50, 5), { cumulative: usage(50, 5) }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 165);
  incomplete(report);
  assert.ok(
    codes(report).some((code) =>
      ["coverage_gap", "counter_reset"].includes(code),
    ),
  );
});

test("AC-4: explicit fork remains unknown despite valid own records", async (t) => {
  const f = await fixture(t);
  await f.source("parent", [], { forked_from_id: "old-thread" });
  f.start();
  await f.append("parent", [context("turn-a"), record("parent", "own")]);
  f.stop();
  const report = f.report();
  total(report, 110);
  hasCode(report, "fork_semantics_unknown");
  assert.equal(report.completeness, "unknown");
});

test("AC-4/7: missing source makes report unknown and mutation fails without changing manifest", async (t) => {
  const f = await fixture(t);
  const source = await f.source("parent");
  f.start();
  await f.source("child", [
    context("turn-a"),
    record("child", "child", usage(50, 5)),
  ]);
  f.attach("child");
  f.stop("child");
  const before = await f.manifest();
  await rm(source);
  f.stop("parent", { status: 1 });
  assert.equal(await f.manifest(), before);
  const report = f.report();
  total(report, 55);
  assert.equal(report.completeness, "unknown");
  assert.ok(report.diagnostics.length > 0);
});

test("AC-6: active turn after stop and unattached child prevent a complete report", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  const opened = f.report();
  assert.equal(opened.provisional, true);
  incomplete(opened);
  await f.append("parent", [
    event("event_msg", { type: "task_started", turn_id: "turn-a" }),
    context("turn-a"),
    record("parent", "active"),
  ]);
  await f.source("unattached-child", [], { parent_thread_id: "parent" });
  f.stop();
  const report = f.report();
  total(report, 110);
  assert.equal(report.provisional, true);
  incomplete(report);
  assert.ok(JSON.stringify(report).includes("unattached-child"));
  hasCode(report, "unattached_threads");
  assert.ok(!report.rows.some((row) => row.role === "developer"));
  const markdown = f.call("report", ["--format", "markdown"]).stdout;
  assert.match(markdown, /unattached-child|unattached_threads/);
});

test("AC-7: changed saved prefix rejects mutation; report gives source_changed", async (t) => {
  const f = await fixture(t);
  const source = await f.source("parent");
  f.start();
  const before = await f.manifest();
  await writeFile(
    source,
    lines([
      event("session_meta", {
        id: "parent",
        cli_version: "0.163.0",
        changed: true,
      }),
    ]),
  );
  f.stop("parent", { status: 1 });
  assert.equal(await f.manifest(), before);
  const report = f.report();
  assert.equal(report.completeness, "unknown");
  hasCode(report, "source_changed");
});

test("AC-7: sources are identified only by metadata and duplicate ID is rejected", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  await f.put(
    "input-sessions/copy.jsonl",
    await readFile(path.join(f.sessionsRoot, "parent.jsonl"), "utf8"),
  );
  const before = await digestTree(f.root);
  f.start("parent", { status: 1 });
  assert.deepEqual(await digestTree(f.root), before);
  await rm(path.join(f.sessionsRoot, "copy.jsonl"));
  await f.source("other", [
    event("response_item", {
      type: "message",
      content: [{ text: "pretend-thread-id" }],
    }),
  ]);
  f.start("pretend-thread-id", { status: 1 });
  f.call("start", ["--task", taskPath], { status: 1 });
});

test("AC-7: traversal, invalid task and foreign manifest cannot create or overwrite files", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  const before = await digestTree(f.root);
  f.start("parent", { status: 1, run: ".agents/project/sessions/../escape" });
  f.start("parent", { status: 1, run: ".agents/project/sessions/Bad_Run" });
  f.call(
    "start",
    ["--task", ".agents/project/tasks/missing.md", "--thread", "parent"],
    { status: 1 },
  );
  await f.put(".agents/project/tasks/bad.md", "# Missing status\n");
  f.call(
    "start",
    ["--task", ".agents/project/tasks/bad.md", "--thread", "parent"],
    { status: 1 },
  );
  await rm(path.join(f.root, ".agents/project/tasks/bad.md"));
  assert.deepEqual(await digestTree(f.root), before);
  const sentinel = await f.put(`${session}/token-manifest.json`, secret);
  f.start("parent", { status: 1 });
  assert.equal(await readFile(sentinel, "utf8"), secret);
});

test("AC-7: report output validates filename, ownership, format and safe rewrites", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  f.stop();
  const before = await digestTree(f.root);
  for (const output of [
    "tokens.json",
    `${session}/../tokens.json`,
    `${session}/custom.json`,
    `${session}/tokens.md`,
  ]) {
    f.call("report", ["--format", "json", "--output", output], { status: 1 });
  }
  assert.deepEqual(await digestTree(f.root), before);
  const sentinel = await f.put(
    `${session}/tokens.json`,
    JSON.stringify({ kind: "foreign", secret }),
  );
  const original = await readFile(sentinel, "utf8");
  f.call("report", ["--output", `${session}/tokens.json`], { status: 1 });
  assert.equal(await readFile(sentinel, "utf8"), original);
  await rm(sentinel);
  f.call("report", ["--output", `${session}/tokens.json`]);
  f.call("report", ["--output", `${session}/tokens.json`]);
  assert.equal(
    JSON.parse(await readFile(sentinel, "utf8")).kind,
    "task-token-report",
  );
  f.call("report", [
    "--format",
    "markdown",
    "--output",
    `${session}/tokens.md`,
  ]);
  f.call("report", [
    "--format",
    "markdown",
    "--output",
    `${session}/tokens.md`,
  ]);
});

test("AC-7: hardlinked report target is refused without altering its peer", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  f.stop();
  f.call("report", ["--output", `${session}/tokens.json`]);
  const target = path.join(f.root, session, "tokens.json");
  const peer = path.join(f.root, "peer.json");
  await link(target, peer);
  const before = await readFile(peer, "utf8");
  f.call("report", ["--output", `${session}/tokens.json`], { status: 1 });
  assert.equal(await readFile(peer, "utf8"), before);
});

test("AC-7: junction session and escaped source link are refused", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  const outside = path.join(f.root, "outside");
  await mkdir(outside);
  const linkedSession = path.join(f.root, ".agents/project/sessions/linked");
  await symlink(outside, linkedSession, "junction");
  f.start("parent", { status: 1, run: ".agents/project/sessions/linked" });
  assert.deepEqual(await readdir(outside), []);
  const foreign = path.join(f.root, "foreign-sessions");
  await mkdir(foreign);
  await writeFile(
    path.join(foreign, "foreign.jsonl"),
    lines([event("session_meta", { id: "escaped" })]),
  );
  await symlink(foreign, path.join(f.sessionsRoot, "linked"), "junction");
  f.start("escaped", { status: 1 });
});

test("AC-7: concurrent mutation has one winner and leaves a valid manifest without lock debris", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.source("child", [
    context("turn-a"),
    record("child", "c", usage(50, 5)),
  ]);
  // Два процесса спорят об одном interval; ни один не должен перезаписать чужую запись.
  const { spawn } = await import("node:child_process");
  function concurrent() {
    return new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [
          cli,
          "attach",
          session,
          "--task",
          taskPath,
          "--thread",
          "child",
          "--role",
          "developer",
          "--attempt",
          "0",
          "--from-start",
          "--sessions-root",
          f.sessionsRoot,
        ],
        { cwd: f.root, stdio: "pipe" },
      );
      let output = "";
      child.stdout.on("data", (value) => {
        output += value;
      });
      child.stderr.on("data", (value) => {
        output += value;
      });
      child.on("error", reject);
      child.on("close", (code) => resolve({ code, output }));
    });
  }
  const results = await Promise.all([concurrent(), concurrent()]);
  assert.deepEqual(results.map((value) => value.code).sort(), [0, 1]);
  assert.ok(results.every((value) => !value.output.includes(secret)));
  JSON.parse(await f.manifest());
  f.stop("child");
  f.stop();
  total(f.report(), 55);
  assert.deepEqual((await readdir(path.join(f.root, session))).sort(), [
    "token-manifest.json",
  ]);
});

test("AC-8: final report includes every project role and attempts 0 through 3", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [context("turn-a"), record("parent", "root")]);
  f.stop();
  const roles = [
    "supervisor",
    "spec-writer",
    "developer",
    "tester",
    "reviewer",
  ];
  for (const [index, role] of roles.entries()) {
    const id = `role-${index}`;
    await f.source(
      id,
      [context("turn-a"), record(id, `response-${index}`, usage(50, 5))],
      { parent_thread_id: "parent" },
    );
    f.attach(id, { role, attempt: Math.min(index, 3) });
    f.stop(id);
  }
  const report = f.report();
  total(report, 385);
  assert.equal(report.tasks[0].observed_usage.total_tokens, 385);
  assert.equal(report.completeness, "complete");
  assert.deepEqual(
    [...new Set(report.rows.map((row) => row.role))].sort(),
    [...roles].sort(),
  );
  assert.deepEqual(
    [...new Set(report.rows.map((row) => row.attempt))].sort(),
    [0, 1, 2, 3],
  );
  assert.match(f.call("report", ["--format", "markdown"]).stdout, /385/);
});

test("AC-2/4: a closed interval never consumes later full records or a completed tail", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [context("turn-a"), record("parent", "first")]);
  const tail = JSON.stringify(
    record("parent", "tail", usage(50, 5), { cumulative: usage(150, 15) }),
  );
  const source = path.join(f.sessionsRoot, "parent.jsonl");
  await appendFile(source, tail.slice(0, 25));
  f.stop();
  const closedManifest = await f.manifest();
  const before = f.report();
  total(before, 110);
  await appendFile(source, tail.slice(25) + "\n");
  await f.append("parent", [
    record("parent", "future", usage(20, 2), { cumulative: usage(170, 17) }),
  ]);
  total(f.report(), 110);
  f.stop();
  assert.equal(await f.manifest(), closedManifest);
});

test("AC-4: cumulative token_count decrease is diagnostic and never subtracted from observed usage", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "own"),
    legacy(usage(900, 100)),
    legacy(usage(10, 1)),
  ]);
  f.stop();
  const report = f.report();
  total(report, 110);
  incomplete(report);
  assert.ok(
    codes(report).some((code) =>
      ["coverage_gap", "counter_reset"].includes(code),
    ),
  );
});

test("AC-4/5: malformed required response identity is never attributed", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  const bad = record("parent", "");
  const missingTurn = record("parent", "missing-turn");
  delete missingTurn.payload.turn_id;
  await f.append("parent", [
    context("turn-a"),
    bad,
    missingTurn,
    record("parent", "valid", usage(50, 5)),
  ]);
  f.stop();
  const report = f.report();
  total(report, 55);
  incomplete(report);
  assert.ok(report.diagnostics.length > 0);
});

test("AC-7: source truncation rejects stop and reports source_changed", async (t) => {
  const f = await fixture(t);
  const source = await f.source("parent", [context("turn-a")]);
  f.start();
  const before = await f.manifest();
  await writeFile(source, lines([event("session_meta", { id: "parent" })]));
  f.stop("parent", { status: 1 });
  assert.equal(await f.manifest(), before);
  const report = f.report();
  hasCode(report, "source_changed");
  assert.equal(report.completeness, "unknown");
});

test("AC-7: duplicate explicit options and unsupported format are rejected", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  f.stop();
  const before = await digestTree(f.root);
  f.call("report", ["--format", "json", "--format", "markdown"], { status: 1 });
  f.call("report", ["--format", "html"], { status: 1 });
  assert.deepEqual(await digestTree(f.root), before);
});

test("regression R-1: live reports include appended complete records without stop and remain idempotent", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  total(f.report(), 0);
  await f.append("parent", [context("turn-a"), record("parent", "first")]);
  const first = f.report();
  total(first, 110);
  assert.equal(first.provisional, true);
  assert.ok(!codes(first).includes("truncated_tail"));
  total(f.report(), 110);
  await f.append("parent", [
    record("parent", "second", usage(50, 5), { cumulative: usage(150, 15) }),
  ]);
  total(f.report(), 165);
  f.stop();
  await f.append("parent", [
    record("parent", "after-stop", usage(20, 2), {
      cumulative: usage(170, 17),
    }),
  ]);
  total(f.report(), 165);
});

for (const missingFirst of [true, false]) {
  for (const separateModels of [true, false]) {
    test(`regression R-2: missing subsets stay null (${missingFirst ? "before" : "after"} known, ${separateModels ? "multiple rows" : "same row"})`, async (t) => {
      const f = await fixture(t);
      await f.source("parent");
      f.start();
      const known = usage(100, 10, {
        cached_input_tokens: 5,
        cache_write_input_tokens: 7,
        reasoning_output_tokens: 2,
      });
      const missing = {
        input_tokens: 100,
        output_tokens: 10,
        total_tokens: 110,
      };
      const values = missingFirst
        ? [missing, known, known]
        : [known, missing, known];
      for (const [index, value] of values.entries()) {
        await f.append("parent", [
          context(
            "turn-a",
            separateModels && index === 2 ? "model-b" : "model-a",
          ),
          record("parent", `response-${index}`, value, {
            cumulative: usage(100 * (index + 1), 10 * (index + 1)),
          }),
        ]);
      }
      f.stop();
      const report = f.report();
      total(report, 330);
      for (const field of [
        "cached_input_tokens",
        "cache_write_input_tokens",
        "reasoning_output_tokens",
      ]) {
        assert.equal(report.observed_usage[field], null);
        assert.equal(report.tasks[0].observed_usage[field], null);
        assert.equal(
          report.rows.find((row) => row.model === "model-a").observed_usage[
            field
          ],
          null,
        );
      }
    });
  }
}

test("regression R-3: three conflicting copies never subtract the original response twice", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [context("turn-a"), record("parent", "conflict")]);
  f.stop();
  await f.source(
    "child",
    [
      context("turn-a"),
      record("child", "conflict", usage(50, 5)),
      record("child", "conflict", usage(51, 5), { cumulative: usage(101, 10) }),
      record("child", "safe", usage(20, 2), { cumulative: usage(121, 12) }),
    ],
    { parent_thread_id: "parent" },
  );
  f.attach("child");
  f.stop("child");
  const report = f.report();
  total(report, 22);
  hasCode(report, "response_conflict");
  assert.equal(report.completeness, "unknown");
  assert.equal(report.unassigned_usage.total_tokens, 0);
  for (const value of [
    report.observed_usage,
    ...report.rows.map((row) => row.observed_usage),
    ...report.tasks.map((row) => row.observed_usage),
  ]) {
    assert.ok(
      Object.values(value).every((counter) => counter === null || counter >= 0),
    );
  }
});

test("regression R-4: attach rejects a changed saved prefix without changing the manifest", async (t) => {
  const f = await fixture(t);
  const source = await f.source("parent");
  f.start();
  f.stop();
  const before = await f.manifest();
  const text = await readFile(source, "utf8");
  assert.ok(text.includes("0.163.0"));
  await writeFile(source, text.replace("0.163.0", "0.163.1"));
  f.attach("parent", { fromStart: false, attempt: 1 }, { status: 1 });
  assert.equal(await f.manifest(), before);
});

test("regression R-5: model metadata before checkpoint applies without counting historical usage", async (t) => {
  const f = await fixture(t);
  await f.source("parent", [
    context("turn-a", "historical-model"),
    record("parent", "old"),
  ]);
  f.start();
  await f.append("parent", [
    record("parent", "current", usage(50, 5), { cumulative: usage(150, 15) }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 55);
  assert.equal(report.rows[0].model, "historical-model");
  assert.ok(!codes(report).includes("missing_model"));
  assert.equal(report.completeness, "complete");
});

test("regression R-6: the first cumulative gap after a meta-only checkpoint is detected", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "first", usage(), { cumulative: usage(900, 100) }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 110);
  hasCode(report, "coverage_gap");
  incomplete(report);
});

test("regression R-7: loaded overlapping ownership is rejected before report or mutation", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [context("turn-a"), record("parent", "one")]);
  f.stop();
  const manifest = JSON.parse(await f.manifest());
  manifest.intervals.push({
    ...manifest.intervals[0],
    id: "overlap-copy",
    role: "reviewer",
  });
  await f.put(`${session}/token-manifest.json`, JSON.stringify(manifest));
  const before = await f.manifest();
  f.call("report", [], { status: 1 });
  f.attach("parent", { fromStart: false, attempt: 1 }, { status: 1 });
  assert.equal(await f.manifest(), before);
});

test("regression R-8: duplicated responses cannot conceal a cumulative coverage gap", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  f.stop();
  const duplicate = record("child", "same");
  await f.source(
    "child",
    [
      context("turn-a"),
      duplicate,
      duplicate,
      record("child", "next", usage(), { cumulative: usage(280, 20) }),
    ],
    { parent_thread_id: "parent" },
  );
  f.attach("child");
  f.stop("child");
  const report = f.report();
  total(report, 220);
  hasCode(report, "coverage_gap");
  incomplete(report);
});

test("regression R-9: Markdown includes the known cache-write counter from JSON", async (t) => {
  const f = await fixture(t);
  await f.source("parent");
  f.start();
  await f.append("parent", [
    context("turn-a"),
    record("parent", "one", usage(100, 10, { cache_write_input_tokens: 7 })),
  ]);
  f.stop();
  assert.equal(f.report().observed_usage.cache_write_input_tokens, 7);
  const markdown = f.call("report", ["--format", "markdown"]).stdout;
  assert.match(
    markdown,
    /cache.?write|запис[^\n|]{0,25}к[эе]ш|к[эе]ш[^\n|]{0,25}запис/iu,
  );
  assert.match(markdown, /\b7\b/u);
});

const optionalFields = [
  "cached_input_tokens",
  "cache_write_input_tokens",
  "reasoning_output_tokens",
];

for (const missingField of optionalFields) {
  test(`cycle2 R-2a: unknown ${missingField} preserves the other known optional counters`, async (t) => {
    const f = await fixture(t);
    await f.source("parent");
    f.start();
    const value = usage(100, 10, {
      cached_input_tokens: 5,
      cache_write_input_tokens: 7,
      reasoning_output_tokens: 2,
    });
    delete value[missingField];
    await f.append("parent", [
      context("turn-a"),
      record("parent", "partially-known", value),
    ]);
    f.stop();
    const report = f.report();
    total(report, 110);
    const expected = {
      cached_input_tokens: 5,
      cache_write_input_tokens: 7,
      reasoning_output_tokens: 2,
    };
    expected[missingField] = null;
    for (const field of optionalFields) {
      assert.equal(report.rows[0].observed_usage[field], expected[field]);
      assert.equal(report.tasks[0].observed_usage[field], expected[field]);
      assert.equal(report.observed_usage[field], expected[field]);
    }
  });

  test(`cycle2 R-2b: unknown ${missingField} in a gap propagates through unassigned to the run`, async (t) => {
    const f = await fixture(t);
    await f.source("parent");
    f.start();
    f.stop();
    const known = usage(100, 10, {
      cached_input_tokens: 5,
      cache_write_input_tokens: 7,
      reasoning_output_tokens: 2,
    });
    const missing = { ...known };
    delete missing[missingField];
    await f.append("parent", [
      context("turn-a"),
      record("parent", "gap-known", known),
      record("parent", "gap-partial", missing, { cumulative: usage(200, 20) }),
    ]);
    f.attach("parent", { fromStart: false, attempt: 1 });
    await f.append("parent", [
      record("parent", "assigned", usage(), { cumulative: usage(300, 30) }),
    ]);
    f.stop();
    const report = f.report();
    total(report, 330);
    assert.equal(report.unassigned_usage.total_tokens, 220);
    const expected = {
      cached_input_tokens: 10,
      cache_write_input_tokens: 14,
      reasoning_output_tokens: 4,
    };
    expected[missingField] = null;
    for (const field of optionalFields) {
      assert.equal(report.unassigned_usage[field], expected[field]);
      assert.equal(report.observed_usage[field], expected[field]);
      assert.equal(report.rows[0].observed_usage[field], 0);
      assert.equal(report.tasks[0].observed_usage[field], 0);
    }
  });
}

test("cycle2 R-10: lagging token_count before checkpoint never replaces the modern baseline", async (t) => {
  const f = await fixture(t);
  await f.source("parent", [
    context("turn-a"),
    record("parent", "historical"),
    legacy(usage(0, 0)),
  ]);
  f.start();
  await f.append("parent", [
    record("parent", "current", usage(), { cumulative: usage(200, 20) }),
  ]);
  f.stop();
  const report = f.report();
  total(report, 110);
  assert.equal(report.completeness, "complete");
  assert.ok(!codes(report).includes("coverage_gap"));
  assert.ok(!codes(report).includes("counter_reset"));
});
