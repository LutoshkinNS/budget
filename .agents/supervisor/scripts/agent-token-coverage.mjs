import {
  lstat,
  readFile,
  realpath,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { validateManifest } from "./agent-tokens.mjs";

const roles = new Set([
  "supervisor",
  "spec-writer",
  "developer",
  "tester",
  "reviewer",
]);
const runPattern = /^[a-z0-9][a-z0-9-]*$/u;
const taskPattern =
  /^projects\/tasks\/([a-z0-9][a-z0-9-]*)\/work-items\/[a-z0-9][a-z0-9-]*\.md$/u;
const tupleKey = ({ thread_id, task, role, attempt }) =>
  JSON.stringify([thread_id, task, role, attempt]);
const inside = (base, target) => {
  const relative = path.relative(base, target);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`))
  );
};
const exactKeys = (value, keys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

async function localPath(
  root,
  relative,
  { directory = false, allowMissing = false } = {},
) {
  if (
    typeof relative !== "string" ||
    !relative ||
    relative.includes("\0") ||
    relative.includes("\\") ||
    path.posix.isAbsolute(relative) ||
    relative.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new Error("Invalid repository path.");
  const target = path.resolve(root, relative);
  if (!inside(root, target)) throw new Error("Path is outside the repository.");
  let cursor = root;
  const parts = path.relative(root, target).split(path.sep);
  for (const [index, part] of parts.entries()) {
    cursor = path.join(cursor, part);
    let info;
    try {
      info = await lstat(cursor);
    } catch (error) {
      if (allowMissing && index === parts.length - 1 && error.code === "ENOENT")
        return null;
      throw error;
    }
    if (info.isSymbolicLink() || (info.isFile() && info.nlink > 1n))
      throw new Error("Linked paths are not allowed.");
  }
  const actual = await realpath(target);
  if (!inside(root, actual)) throw new Error("Path resolves outside the repository.");
  const info = await stat(actual);
  if (directory ? !info.isDirectory() : !info.isFile())
    throw new Error(directory ? "Expected a directory." : "Expected a file.");
  return target;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function validateRegistry(registry, run, work, root) {
  if (
    !exactKeys(registry, ["schema_version", "kind", "run", "launches"]) ||
    registry.schema_version !== 1 ||
    registry.kind !== "agent-launch-registry" ||
    registry.run !== run ||
    !Array.isArray(registry.launches)
  )
    throw new Error("Invalid launch registry.");
  const keys = new Set();
  for (const launch of registry.launches) {
    if (
      !exactKeys(launch, ["thread_id", "task", "role", "attempt", "state"]) ||
      typeof launch.thread_id !== "string" ||
      !launch.thread_id.trim() ||
      !roles.has(launch.role) ||
      !Number.isInteger(launch.attempt) ||
      launch.attempt < 0 ||
      launch.attempt > 3 ||
      !new Set(["open", "closed"]).has(launch.state)
    )
      throw new Error("Invalid launch registry entry.");
    const taskWork = taskPattern.exec(launch.task)?.[1];
    if (!taskWork || taskWork !== work)
      throw new Error("Launch task must be a work-item in the same work.");
    await localPath(root, launch.task);
    const key = tupleKey(launch);
    if (keys.has(key)) throw new Error("Duplicate launch registry tuple.");
    keys.add(key);
  }
}

function diagnostic(code, launch, interval) {
  return {
    code,
    ...(launch?.thread_id ? { thread_id: launch.thread_id } : {}),
    ...(launch?.task ? { task: launch.task } : {}),
    ...(launch?.role ? { role: launch.role } : {}),
    ...(Number.isInteger(launch?.attempt) ? { attempt: launch.attempt } : {}),
    ...(interval?.id ? { interval_id: interval.id } : {}),
  };
}

export async function runCoverage(session, { cwd = process.cwd() } = {}) {
  const root = await realpath(cwd);
  if (
    typeof session !== "string" ||
    session.includes("\\") ||
    !/^projects\/tasks\/([a-z0-9][a-z0-9-]*)\/sessions\/([a-z0-9][a-z0-9-]*)$/u.test(
      session,
    )
  )
    throw new Error("Session path must be a valid task-scoped session directory.");
  const [, work, run] = /^projects\/tasks\/([a-z0-9][a-z0-9-]*)\/sessions\/([a-z0-9][a-z0-9-]*)$/u.exec(session);
  if (!runPattern.test(run)) throw new Error("Invalid session name.");
  const sessionPath = await localPath(root, session, {
    directory: true,
    allowMissing: true,
  });
  if (!sessionPath)
    return {
      schema_version: 1,
      kind: "task-token-coverage",
      run,
      status: "unknown",
      open: [],
      diagnostics: [diagnostic("registry_missing")],
    };
  const registryFile = await localPath(root, `${session}/launches.json`).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  const manifestFile = await localPath(root, `${session}/token-manifest.json`).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  const hasRegistry = registryFile !== null;
  const hasManifest = manifestFile !== null;
  const registry = hasRegistry ? await readJson(registryFile) : null;
  const manifest = hasManifest ? await readJson(manifestFile) : null;
  if (hasManifest) validateManifest(manifest, run, work);
  if (hasRegistry) await validateRegistry(registry, run, work, root);

  const launches = registry?.launches ?? [];
  const intervals = manifest?.intervals ?? [];
  const diagnostics = [];
  const open = [];
  if (!hasRegistry) {
    diagnostics.push(diagnostic("registry_missing"));
    return {
      schema_version: 1,
      kind: "task-token-coverage",
      run,
      status: "unknown",
      open,
      diagnostics,
    };
  }
  if (!hasManifest) diagnostics.push(diagnostic("manifest_missing"));

  for (const launch of launches) {
    const exact = intervals.filter((interval) => tupleKey(interval) === tupleKey(launch));
    if (exact.length === 0) {
      const sameThread = intervals.some((interval) => interval.thread_id === launch.thread_id);
      diagnostics.push(diagnostic(sameThread ? "ownership_mismatch" : "missing_interval", launch));
      continue;
    }
    for (const interval of exact) {
      if (launch.state === "closed" && interval.end === null)
        diagnostics.push(diagnostic("unclosed_interval", launch, interval));
      if (launch.state === "open" && interval.end === null)
        open.push({
          thread_id: launch.thread_id,
          task: launch.task,
          role: launch.role,
          attempt: launch.attempt,
          interval_id: interval.id,
        });
    }
  }
  for (const interval of intervals)
    if (!launches.some((launch) => tupleKey(launch) === tupleKey(interval)))
      diagnostics.push(diagnostic("unregistered_interval", interval, interval));

  const status =
    diagnostics.length === 0 ? "complete" : "partial";
  return {
    schema_version: 1,
    kind: "task-token-coverage",
    run,
    status,
    open,
    diagnostics,
  };
}

export function renderCoverageMarkdown(coverage) {
  const lines = [
    `# Покрытие учёта токенов: ${coverage.run}`,
    "",
    `Статус: **${coverage.status}**.`,
    "",
    "## Открытые интервалы",
    "",
    ...(coverage.open.length
      ? coverage.open.map(
          (item) =>
            `- ${item.thread_id} — ${item.task}, ${item.role}, попытка ${item.attempt}, интервал ${item.interval_id}`,
        )
      : ["- Нет."]),
    "",
    "## Диагностика",
    "",
    ...(coverage.diagnostics.length
      ? coverage.diagnostics.map((item) => {
          const context = [
            item.thread_id,
            item.task,
            item.role,
            Number.isInteger(item.attempt) ? `attempt ${item.attempt}` : null,
            item.interval_id,
          ]
            .filter(Boolean)
            .join(", ");
          return `- ${item.code}${context ? ` (${context})` : ""}`;
        })
      : ["- Нет."]),
    "",
    "Покрытие назначений не подтверждает полноту token report.",
  ];
  return `${lines.join("\n")}\n`;
}
