import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const roles = new Set([
  "supervisor",
  "spec-writer",
  "developer",
  "tester",
  "reviewer",
]);
const runPattern = /^[a-z0-9][a-z0-9-]*$/u;
const totals = () => ({
  input_tokens: 0,
  cached_input_tokens: null,
  cache_write_input_tokens: null,
  output_tokens: 0,
  reasoning_output_tokens: null,
  total_tokens: 0,
});
const missingSubsets = new WeakMap();
const add = (target, usage, { propagateMissing = false } = {}) => {
  for (const key of Object.keys(target)) {
    let unknownFields = missingSubsets.get(target);
    if (!unknownFields) {
      unknownFields = new Set();
      missingSubsets.set(target, unknownFields);
    }
    if (!Number.isSafeInteger(usage[key])) {
      if (propagateMissing && key in usage) {
        target[key] = null;
        unknownFields.add(key);
      }
      continue;
    } else if (target[key] === null && !unknownFields.has(key))
      target[key] = usage[key];
    else if (target[key] !== null) target[key] += usage[key];
  }
};
const subtract = (target, usage) => {
  for (const key of Object.keys(target))
    if (target[key] !== null && Number.isSafeInteger(usage[key]))
      target[key] -= usage[key];
};
const inside = (base, target) => {
  const rel = path.relative(base, target);
  return (
    rel === "" ||
    (!path.isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${path.sep}`))
  );
};
const hash = (data) => createHash("sha256").update(data).digest("hex");

function assertRelative(value, label) {
  if (
    typeof value !== "string" ||
    !value ||
    value.includes("\0") ||
    path.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    value.split(/[\\/]/u).some((part) => part === "..")
  )
    throw new Error(`Invalid ${label} path.`);
}

function assertManifestWork(manifest, work) {
  if (
    work !== null &&
    manifest.intervals.some((interval) => {
      const task =
        /^projects\/tasks\/([a-z0-9][a-z0-9-]*)\/work-items\/[a-z0-9][a-z0-9-]*\.md$/u.exec(
          interval.task,
        )?.[1];
      return task !== work;
    })
  )
    throw new Error("Token manifest contains a task outside its session work.");
}

async function safePath(root, value, { allowMissing = false } = {}) {
  assertRelative(value, "repository");
  const target = path.resolve(root, value);
  if (!inside(root, target)) throw new Error("Path is outside the repository.");
  let cursor = target;
  while (inside(root, cursor)) {
    try {
      const info = await lstat(cursor);
      if (info.isSymbolicLink() || (info.isFile() && info.nlink > 1n))
        throw new Error("Linked paths are not allowed.");
      break;
    } catch (error) {
      if (error.code !== "ENOENT" || !allowMissing) throw error;
      cursor = path.dirname(cursor);
    }
  }
  const parent = await realpath(path.dirname(target));
  if (!inside(root, parent))
    throw new Error("Path resolves outside the repository.");
  return target;
}

async function rootContext(cwd, sessionsRoot) {
  const repo = await realpath(cwd);
  const sessions = await realpath(path.resolve(cwd, sessionsRoot));
  if (!(await stat(sessions)).isDirectory())
    throw new Error("Sessions root must be a directory.");
  return { repo, sessions };
}

async function sessionFiles(root) {
  const result = [];
  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isSymbolicLink()) continue;
      if (item.isDirectory()) await walk(full);
      else if (item.isFile() && item.name.endsWith(".jsonl")) result.push(full);
    }
  }
  await walk(root);
  return result;
}

async function findSource(sessions, threadId) {
  const matches = [];
  for (const file of await sessionFiles(sessions)) {
    const source = await readFile(file, "utf8");
    for (const line of source.split("\n")) {
      if (!line) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }
      if (event.type === "session_meta" && event.payload?.id === threadId) {
        matches.push(file);
        break;
      }
    }
  }
  if (matches.length === 0)
    throw new Error(`No session source found for thread ${threadId}.`);
  if (matches.length > 1)
    throw new Error(`Ambiguous session source for thread ${threadId}.`);
  return matches[0];
}

async function sourceMetadata(file) {
  for (const line of (await readFile(file, "utf8")).split("\n")) {
    if (!line) continue;
    try {
      const event = JSON.parse(line);
      if (event.type === "session_meta" && event.payload?.id)
        return {
          thread_id: event.payload.id,
          parent_thread_id: event.payload.parent_thread_id ?? null,
          forked_from_id: event.payload.forked_from_id ?? null,
        };
    } catch {
      /* Некорректные JSONL-события пропускаются. */
    }
  }
  throw new Error("Session source has no valid session_meta event.");
}

async function checkpoint(file, sessions) {
  const actual = await realpath(file);
  if (!inside(sessions, actual))
    throw new Error("Session source resolves outside sessions root.");
  const bytes = await readFile(actual);
  const lastNewline = bytes.lastIndexOf(10) + 1;
  let activeTurnId = null;
  for (const line of bytes
    .subarray(0, lastNewline)
    .toString("utf8")
    .split("\n")) {
    if (!line) continue;
    try {
      const event = JSON.parse(line);
      if (event.type === "event_msg" && event.payload?.type === "task_started")
        activeTurnId = event.payload.turn_id ?? null;
      if (event.type === "event_msg" && event.payload?.type === "task_complete")
        activeTurnId = null;
    } catch {
      /* Некорректные JSONL-события пропускаются. */
    }
  }
  return {
    offset: lastNewline,
    sha256: hash(bytes.subarray(0, lastNewline)),
    captured_at: new Date().toISOString(),
    active_turn_id: activeTurnId,
  };
}

async function withManifest(runPath, action) {
  const lockPath = path.join(runPath, ".token-manifest.lock");
  let lock;
  try {
    lock = await open(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error("Token manifest is locked by another command.");
    throw error;
  }
  try {
    return await action();
  } finally {
    await lock.close();
    await import("node:fs/promises").then(({ unlink }) =>
      unlink(lockPath).catch(() => {}),
    );
  }
}

async function saveManifest(file, manifest) {
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(manifest, null, 2)}\n`, {
    flag: "wx",
  });
  await rename(temp, file);
}

async function loadManifest(runPath, run) {
  const file = path.join(runPath, "token-manifest.json");
  const manifest = JSON.parse(await readFile(file, "utf8"));
  if (
    manifest.schema_version !== 1 ||
    manifest.kind !== "task-token-manifest" ||
    manifest.run !== run ||
    !Array.isArray(manifest.sources) ||
    manifest.sources.length === 0 ||
    !Array.isArray(manifest.intervals) ||
    manifest.intervals.length === 0
  )
    throw new Error("Invalid token manifest.");
  const sourceIds = new Set();
  for (const source of manifest.sources) {
    if (
      !source ||
      typeof source.thread_id !== "string" ||
      sourceIds.has(source.thread_id) ||
      typeof source.path !== "string" ||
      path.posix.isAbsolute(source.path) ||
      path.win32.isAbsolute(source.path) ||
      source.path
        .split(/[\\/]/u)
        .some((part) => !part || part === "." || part === "..") ||
      !validCheckpoint(source.initial) ||
      (source.end !== undefined && !validCheckpoint(source.end))
    )
      throw new Error("Invalid token manifest source.");
    sourceIds.add(source.thread_id);
  }
  const intervalIds = new Set();
  for (const interval of manifest.intervals) {
    if (
      !interval ||
      typeof interval.id !== "string" ||
      intervalIds.has(interval.id) ||
      !sourceIds.has(interval.thread_id) ||
      typeof interval.task !== "string" ||
      !roles.has(interval.role) ||
      !Number.isInteger(interval.attempt) ||
      interval.attempt < 0 ||
      interval.attempt > 3 ||
      !validCheckpoint(interval.start) ||
      (interval.end !== null && !validCheckpoint(interval.end)) ||
      (interval.end !== null && interval.end.offset < interval.start.offset)
    )
      throw new Error("Invalid token manifest interval.");
    intervalIds.add(interval.id);
  }
  for (
    let leftIndex = 0;
    leftIndex < manifest.intervals.length;
    leftIndex += 1
  ) {
    const left = manifest.intervals[leftIndex];
    for (const right of manifest.intervals.slice(leftIndex + 1)) {
      if (
        left.thread_id === right.thread_id &&
        left.start.offset < (right.end?.offset ?? Infinity) &&
        right.start.offset < (left.end?.offset ?? Infinity)
      )
        throw new Error("Overlapping token manifest intervals.");
    }
  }
  return { file, manifest };
}

function validCheckpoint(value) {
  return (
    value &&
    Number.isSafeInteger(value.offset) &&
    value.offset >= 0 &&
    typeof value.sha256 === "string" &&
    /^[a-f0-9]{64}$/u.test(value.sha256)
  );
}

async function validateSavedPrefixes(manifest, sessions) {
  for (const source of manifest.sources) {
    const file = path.resolve(sessions, source.path);
    const actual = await realpath(file);
    if (!inside(sessions, actual))
      throw new Error("Session source resolves outside sessions root.");
    const bytes = await readFile(actual);
    const points = [
      source.initial,
      source.end,
      ...manifest.intervals
        .filter((interval) => interval.thread_id === source.thread_id)
        .flatMap((interval) => [interval.start, interval.end]),
    ].filter(Boolean);
    for (const point of points)
      if (
        bytes.length < point.offset ||
        hash(bytes.subarray(0, point.offset)) !== point.sha256
      )
        throw new Error("Session source changed since a saved checkpoint.");
  }
}

async function taskInfo(repo, value) {
  assertRelative(value, "task");
  const file = await safePath(repo, value);
  const text = await readFile(file, "utf8");
  const heading = text.match(
    /^#.*\bstatus\s*:\s*(todo|in-progress|done|blocked)\s*$/imu,
  )?.[1];
  const status =
    heading ??
    text.match(/^Status:\s*(todo|in-progress|done|blocked)\s*$/imu)?.[1];
  if (!status) throw new Error("Task file has no valid status.");
  const work =
    /^projects\/tasks\/([a-z0-9][a-z0-9-]*)\/work-items\/[a-z0-9][a-z0-9-]*\.md$/u.exec(
      value,
    )?.[1] ?? null;
  return { file, status, work };
}

export async function runTokens(
  command,
  options,
  { cwd = process.cwd(), home = os.homedir() } = {},
) {
  const { repo, sessions } = await rootContext(
    cwd,
    options.sessionsRoot ?? path.join(home, ".codex", "sessions"),
  );
  assertRelative(options.session, "session");
  const run = path.basename(options.session);
  const normalizedSession = options.session.replaceAll("\\", "/");
  const sessionMatch =
    /^projects\/tasks\/([a-z0-9][a-z0-9-]*)\/sessions\/([a-z0-9][a-z0-9-]*)$/u.exec(
      normalizedSession,
    );
  const isLegacySession =
    /^\.agents\/project\/sessions\/[a-z0-9][a-z0-9-]*$/u.test(
      normalizedSession,
    );
  if (
    !runPattern.test(run) ||
    (!isLegacySession && !sessionMatch) ||
    (sessionMatch && sessionMatch[2] !== run)
  )
    throw new Error(
      "Session path must be a valid task-scoped session directory.",
    );
  const runPath = await safePath(repo, options.session, { allowMissing: true });
  if (command === "report")
    return buildReport(runPath, run, repo, sessions, sessionMatch?.[1] ?? null);
  await mkdir(runPath, { recursive: true });
  return withManifest(runPath, async () => {
    const manifestPath = path.join(runPath, "token-manifest.json");
    if (command === "start") {
      if (
        await lstat(manifestPath).then(
          () => true,
          () => false,
        )
      )
        throw new Error("Token manifest already exists.");
      if (!options.task || !options.thread)
        throw new Error("start requires --task and --thread.");
      const task = await taskInfo(repo, options.task);
      if (sessionMatch && task.work !== sessionMatch[1])
        throw new Error("Task must belong to the same work as its session.");
      const sourcePath = await findSource(sessions, options.thread);
      const metadata = await sourceMetadata(sourcePath);
      const point = await checkpoint(sourcePath, sessions);
      const relative = path
        .relative(sessions, sourcePath)
        .split(path.sep)
        .join("/");
      const manifest = {
        schema_version: 1,
        kind: "task-token-manifest",
        run,
        sources: [{ ...metadata, path: relative, initial: point, end: point }],
        intervals: [
          {
            id: "interval-1",
            task: options.task,
            thread_id: options.thread,
            role: "supervisor",
            attempt: 0,
            start: point,
            end: null,
          },
        ],
      };
      await saveManifest(manifestPath, manifest);
      return manifest;
    }
    const { file, manifest } = await loadManifest(runPath, run);
    await validateSavedPrefixes(manifest, sessions);
    assertManifestWork(manifest, sessionMatch?.[1] ?? null);
    if (command === "attach") {
      if (
        !options.task ||
        !options.thread ||
        !roles.has(options.role) ||
        !Number.isInteger(options.attempt) ||
        options.attempt < 0 ||
        options.attempt > 3
      )
        throw new Error(
          "attach requires valid --task, --thread, --role and --attempt.",
        );
      const task = await taskInfo(repo, options.task);
      if (sessionMatch && task.work !== sessionMatch[1])
        throw new Error("Task must belong to the same work as its session.");
      if (
        manifest.intervals.some(
          (interval) =>
            interval.thread_id === options.thread && interval.end === null,
        )
      )
        throw new Error("Thread already has an open interval.");
      const existing = manifest.sources.find(
        (source) => source.thread_id === options.thread,
      );
      if (existing && options.fromStart)
        throw new Error(
          "Previously attached source cannot be reopened from start.",
        );
      const sourcePath = existing
        ? path.join(sessions, existing.path)
        : await findSource(sessions, options.thread);
      const point = await checkpoint(sourcePath, sessions);
      const rel = path.relative(sessions, sourcePath).split(path.sep).join("/");
      if (!existing)
        manifest.sources.push({
          ...(await sourceMetadata(sourcePath)),
          path: rel,
          initial: options.fromStart
            ? {
                offset: 0,
                sha256: hash(Buffer.alloc(0)),
                captured_at: point.captured_at,
                active_turn_id: null,
              }
            : point,
          end: point,
        });
      manifest.intervals.push({
        id: `interval-${manifest.intervals.length + 1}`,
        task: options.task,
        thread_id: options.thread,
        role: options.role,
        attempt: options.attempt,
        start: options.fromStart ? manifest.sources.at(-1).initial : point,
        end: null,
      });
    } else if (command === "stop") {
      const interval = [...manifest.intervals]
        .reverse()
        .find((item) => item.thread_id === options.thread);
      if (!interval)
        throw new Error(`Unknown thread: ${options.thread ?? ""}.`);
      if (interval.end === null) {
        const source = manifest.sources.find(
          (item) => item.thread_id === options.thread,
        );
        const bytes = await readFile(path.join(sessions, source.path));
        const saved = source.end ?? source.initial;
        if (hash(bytes.subarray(0, saved.offset)) !== saved.sha256)
          throw new Error("Session source changed since the last checkpoint.");
        interval.end = await checkpoint(
          path.join(sessions, source.path),
          sessions,
        );
      }
      manifest.sources.find(
        (source) => source.thread_id === options.thread,
      ).end = interval.end;
    }
    await saveManifest(file, manifest);
    return manifest;
  });
}

async function buildReport(runPath, run, repo, sessions, work) {
  const { manifest } = await loadManifest(runPath, run);
  assertManifestWork(manifest, work);
  const rowsByKey = new Map();
  const diagnostics = [];
  const seen = new Map();
  const conflicted = new Set();
  const unassigned = totals();
  let unassignedRecordCount = 0;
  const sources = [];
  let provisional = false;
  for (const source of manifest.sources) {
    const file = path.resolve(sessions, source.path);
    try {
      const actual = await realpath(file);
      if (!inside(sessions, actual)) throw new Error("source_path_escape");
      const bytes = await readFile(actual);
      const sourceOpen = manifest.intervals.some(
        (interval) =>
          interval.thread_id === source.thread_id && interval.end === null,
      );
      const latest = sourceOpen
        ? await checkpoint(actual, sessions)
        : source.end;
      provisional ||= sourceOpen || source.end === undefined;
      provisional ||= Boolean(latest.active_turn_id);
      if (sourceOpen && latest.offset < bytes.length) {
        diagnostics.push({
          code: "truncated_tail",
          source: source.path,
          offset: latest.offset,
        });
        provisional = true;
      }
      if (
        hash(bytes.subarray(0, source.initial.offset)) !==
          source.initial.sha256 ||
        (source.end &&
          hash(bytes.subarray(0, source.end.offset)) !== source.end.sha256)
      ) {
        diagnostics.push({ code: "source_changed", source: source.path });
        sources.push({
          thread_id: source.thread_id,
          path: source.path,
          completeness: "unknown",
        });
        continue;
      }
      const intervalPoints = manifest.intervals
        .filter((interval) => interval.thread_id === source.thread_id)
        .flatMap((interval) => [interval.start, interval.end])
        .filter(Boolean);
      if (
        intervalPoints.some(
          (point) =>
            bytes.length < point.offset ||
            hash(bytes.subarray(0, point.offset)) !== point.sha256,
        )
      ) {
        diagnostics.push({ code: "source_changed", source: source.path });
        sources.push({
          thread_id: source.thread_id,
          path: source.path,
          completeness: "unknown",
        });
        continue;
      }
      const startOffset = Math.min(
        ...manifest.intervals
          .filter((i) => i.thread_id === source.thread_id)
          .map((i) => i.start.offset),
        source.initial.offset,
      );
      const endOffset = latest.offset;
      let modelByTurn = new Map();
      let ownRecords = [];
      let cumulativeSeen = false;
      let legacySeen = false;
      let lastCumulative = null;
      let lastLegacyCumulative = null;
      let lastThreadCumulative = null;
      let recordTotal = 0;
      let modernBaseline = null;
      let legacyBaseline = null;
      const lines = bytes.subarray(0, endOffset).toString("utf8").split("\n");
      let offset = 0;
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const lineBytes = Buffer.byteLength(line) + 1;
        const lineOffset = offset;
        offset += lineBytes;
        if (lineOffset >= endOffset || !line) continue;
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          diagnostics.push({
            code: "malformed_line",
            source: source.path,
            line: index + 1,
          });
          continue;
        }
        if (
          event.type === "turn_context" &&
          event.payload?.turn_id &&
          typeof event.payload.model === "string"
        )
          modelByTurn.set(event.payload.turn_id, event.payload.model);
        if (lineOffset < startOffset) {
          const previousUsage =
            event.type === "token_usage_record" &&
            event.payload?.thread_id === source.thread_id
              ? event.payload?.thread_token_usage?.total_tokens
              : null;
          const previousLegacy =
            event.type === "event_msg" && event.payload?.type === "token_count"
              ? event.payload.info?.total_token_usage?.total_tokens
              : null;
          if (Number.isSafeInteger(previousUsage) && previousUsage >= 0)
            modernBaseline = previousUsage;
          else if (Number.isSafeInteger(previousLegacy) && previousLegacy >= 0)
            legacyBaseline = previousLegacy;
          continue;
        }
        const isLegacy =
          event.type === "event_msg" && event.payload?.type === "token_count";
        legacySeen ||= isLegacy;
        const cumulative = isLegacy
          ? event.payload.info?.total_token_usage?.total_tokens
          : null;
        if (Number.isSafeInteger(cumulative) && cumulative >= 0) {
          cumulativeSeen = true;
          if (
            lastLegacyCumulative !== null &&
            cumulative < lastLegacyCumulative
          )
            diagnostics.push({
              code: "counter_reset",
              source: source.path,
              line: index + 1,
            });
          lastLegacyCumulative = cumulative;
          lastCumulative = Math.max(lastCumulative ?? 0, cumulative);
        }
        if (event.type !== "token_usage_record") continue;
        const p = event.payload ?? {};
        const u = p.usage;
        const valid =
          p.thread_id === source.thread_id &&
          p.turn_id &&
          p.response_id &&
          u &&
          ["input_tokens", "output_tokens", "total_tokens"].every(
            (key) => Number.isSafeInteger(u[key]) && u[key] >= 0,
          ) &&
          u.total_tokens === u.input_tokens + u.output_tokens;
        if (!valid) {
          diagnostics.push({
            code:
              p.thread_id === source.thread_id
                ? "invalid_usage"
                : "foreign_record",
            source: source.path,
            line: index + 1,
          });
          continue;
        }
        const invalidSubset =
          [
            "cached_input_tokens",
            "cache_write_input_tokens",
            "reasoning_output_tokens",
          ].some(
            (key) =>
              u[key] !== undefined &&
              (!Number.isSafeInteger(u[key]) || u[key] < 0),
          ) ||
          (Number.isSafeInteger(u.cached_input_tokens) &&
            u.cached_input_tokens > u.input_tokens) ||
          (Number.isSafeInteger(u.reasoning_output_tokens) &&
            u.reasoning_output_tokens > u.output_tokens);
        if (invalidSubset) {
          diagnostics.push({
            code: "invalid_usage",
            source: source.path,
            line: index + 1,
          });
          continue;
        }
        const record = {
          thread_id: p.thread_id,
          turn_id: p.turn_id,
          response_id: p.response_id,
          usage: { ...totals(), ...u },
        };
        const previous = seen.get(record.response_id);
        if (previous) {
          if (JSON.stringify(previous.value) !== JSON.stringify(record)) {
            diagnostics.push({
              code: "response_conflict",
              source: source.path,
              line: index + 1,
            });
            conflicted.add(record.response_id);
            if (previous.applied) {
              subtract(previous.applied, previous.value.usage);
              previous.applied = null;
            }
          }
          continue;
        }
        seen.set(record.response_id, { value: record, applied: null });
        recordTotal += u.total_tokens;
        if (
          p.thread_token_usage &&
          Number.isSafeInteger(p.thread_token_usage.total_tokens)
        ) {
          const threadTotal = p.thread_token_usage.total_tokens;
          if (
            lastThreadCumulative !== null &&
            threadTotal < lastThreadCumulative
          )
            diagnostics.push({
              code: "counter_reset",
              source: source.path,
              line: index + 1,
            });
          lastThreadCumulative = threadTotal;
          lastCumulative = Math.max(lastCumulative ?? 0, threadTotal);
        }
        ownRecords.push({
          record,
          model: modelByTurn.get(p.turn_id) ?? null,
          offset: lineOffset,
        });
      }
      if ((cumulativeSeen || legacySeen) && ownRecords.length === 0) {
        diagnostics.push({
          code: "legacy_without_records",
          source: source.path,
        });
        provisional = true;
      }
      recordTotal = ownRecords
        .filter(({ record }) => !conflicted.has(record.response_id))
        .reduce((total, { record }) => total + record.usage.total_tokens, 0);
      const baselineCumulative = modernBaseline ?? legacyBaseline ?? 0;
      if (
        ownRecords.length > 0 &&
        lastCumulative !== null &&
        lastCumulative > baselineCumulative + recordTotal
      ) {
        diagnostics.push({ code: "coverage_gap", source: source.path });
        provisional = true;
      }
      for (const { record, model, offset: recordOffset } of ownRecords) {
        if (conflicted.has(record.response_id)) continue;
        const interval = manifest.intervals.find(
          (item) =>
            item.thread_id === source.thread_id &&
            recordOffset >= item.start.offset &&
            (item.end === null || recordOffset < item.end.offset),
        );
        const target = interval
          ? (rowsByKey.get(
              JSON.stringify([
                interval.task,
                interval.role,
                model,
                interval.attempt,
              ]),
            ) ?? {
              task: interval.task,
              role: interval.role,
              model,
              attempt: interval.attempt,
              observed_usage: totals(),
              completeness: "complete",
            })
          : null;
        if (target) {
          add(target.observed_usage, record.usage, { propagateMissing: true });
          rowsByKey.set(
            JSON.stringify([
              interval.task,
              interval.role,
              model,
              interval.attempt,
            ]),
            target,
          );
          seen.get(record.response_id).applied = target.observed_usage;
        } else {
          add(unassigned, record.usage, { propagateMissing: true });
          unassignedRecordCount += 1;
          seen.get(record.response_id).applied = unassigned;
        }
      }
      sources.push({
        thread_id: source.thread_id,
        path: source.path,
        start: source.initial,
        end: latest,
        completeness: provisional ? "partial" : "complete",
      });
    } catch {
      diagnostics.push({ code: "source_unavailable", source: source.path });
      sources.push({
        thread_id: source.thread_id,
        path: source.path,
        completeness: "unknown",
      });
    }
  }
  for (const source of manifest.sources) {
    if (source.forked_from_id)
      diagnostics.push({ code: "fork_semantics_unknown", source: source.path });
  }
  const attached = new Set(manifest.sources.map((source) => source.thread_id));
  for (const file of await sessionFiles(sessions)) {
    const metadata = await sourceMetadata(file).catch(() => null);
    if (
      metadata?.parent_thread_id &&
      attached.has(metadata.parent_thread_id) &&
      !attached.has(metadata.thread_id)
    ) {
      diagnostics.push({
        code: "unattached_threads",
        thread_id: metadata.thread_id,
        parent_thread_id: metadata.parent_thread_id,
      });
    }
  }
  for (const diagnostic of diagnostics)
    if (
      [
        "malformed_line",
        "invalid_usage",
        "source_changed",
        "source_unavailable",
        "response_conflict",
        "foreign_record",
        "coverage_gap",
        "counter_reset",
        "legacy_without_records",
      ].includes(diagnostic.code)
    )
      provisional = true;
  const rows = [...rowsByKey.values()].sort(
    (a, b) =>
      a.task.localeCompare(b.task) ||
      a.role.localeCompare(b.role) ||
      a.attempt - b.attempt ||
      (a.model ?? "").localeCompare(b.model ?? ""),
  );
  if (
    provisional ||
    diagnostics.some((d) =>
      [
        "fork_semantics_unknown",
        "unattached_threads",
        "model_unverified",
        "coverage_gap",
        "counter_reset",
      ].includes(d.code),
    )
  )
    for (const row of rows) row.completeness = "partial";
  for (const row of rows)
    if (row.model === null) {
      row.completeness = "partial";
      diagnostics.push({
        code: "missing_model",
        task: row.task,
        role: row.role,
        attempt: row.attempt,
      });
    }
  const tasks = [];
  for (const task of [...new Set(rows.map((row) => row.task))]) {
    const info = await taskInfo(repo, task).catch(() => ({ status: null }));
    const observed = totals();
    for (const row of rows.filter((item) => item.task === task))
      add(observed, row.observed_usage, { propagateMissing: true });
    tasks.push({
      task,
      task_status: info.status,
      observed_usage: observed,
      completeness:
        provisional ||
        diagnostics.some((d) =>
          ["fork_semantics_unknown", "unattached_threads"].includes(d.code),
        )
          ? "partial"
          : "complete",
    });
  }
  const observed = totals();
  for (const row of rows)
    add(observed, row.observed_usage, { propagateMissing: true });
  add(observed, unassigned, {
    propagateMissing: unassignedRecordCount > 0,
  });
  return {
    schema_version: 1,
    kind: "task-token-report",
    run,
    captured_at: new Date().toISOString(),
    sources,
    rows,
    tasks,
    observed_usage: observed,
    unassigned_usage: unassigned,
    diagnostics,
    completeness: diagnostics.some((d) =>
      [
        "source_unavailable",
        "source_changed",
        "response_conflict",
        "fork_semantics_unknown",
      ].includes(d.code),
    )
      ? "unknown"
      : provisional ||
          diagnostics.some((d) =>
            ["unattached_threads", "missing_model"].includes(d.code),
          )
        ? "partial"
        : "complete",
    provisional,
  };
}

export function renderMarkdown(report) {
  const fmt = (usage) =>
    `input ${usage.input_tokens}, cached_input_tokens ${usage.cached_input_tokens ?? "unknown"}, cache_write_input_tokens ${usage.cache_write_input_tokens ?? "unknown"}, output ${usage.output_tokens}, reasoning_output_tokens ${usage.reasoning_output_tokens ?? "unknown"}, total ${usage.total_tokens}`;
  const lines = [
    `# Учёт токенов: ${report.run}`,
    "",
    `Полнота: **${report.completeness}**${report.provisional ? "; отчёт предварительный" : ""}.`,
    "",
    "## По задаче",
    "",
    "| Задача | Роль | Модель | Попытка | Полнота | Расход |",
    "| --- | --- | --- | ---: | --- | --- |",
  ];
  for (const row of report.rows)
    lines.push(
      `| ${row.task} | ${row.role} | ${row.model ?? "неизвестна"} | ${row.attempt} | ${row.completeness} | ${fmt(row.observed_usage)} |`,
    );
  lines.push(
    "",
    `Наблюдаемый расход запуска: ${fmt(report.observed_usage)}.`,
    "",
    "## Диагностика",
    "",
    ...(report.diagnostics.length
      ? report.diagnostics.map(
          (d) =>
            `- ${d.code}${d.source ? ` (${d.source}${d.line ? `:${d.line}` : ""})` : d.thread_id ? ` (${d.thread_id})` : ""}`,
        )
      : ["- Нет."]),
    "",
    `Нераспределённый расход: ${fmt(report.unassigned_usage)}.`,
  );
  return `${lines.join("\n")}\n`;
}
