import { constants } from "node:fs";
import {
  lstat,
  open,
  readFile,
  readdir,
  realpath,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import { parseDocument, stringify } from "yaml";

export const repositoryRoot = fileURLToPath(
  new URL("../../../", import.meta.url),
);

const taskStatuses = new Set(["todo", "in-progress", "done", "blocked"]);
const sessionPattern = /^\.agents\/project\/sessions\/[a-z0-9][a-z0-9-]*$/;
const summaryPattern =
  /^\.agents\/project\/sessions\/([a-z0-9][a-z0-9-]*)\/summary\.yaml$/;
const schema = JSON.parse(
  await readFile(
    new URL("../schemas/agent-result.schema.json", import.meta.url),
    "utf8",
  ),
);
const roles = schema.properties.role.enum;
const ajv = new Ajv({ allErrors: true, strict: true });
const validateMetadata = ajv.compile(schema);

function isInside(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`))
  );
}

function forwardSlashes(value) {
  return value.split(path.sep).join("/");
}

function validateRelativePath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    /[\\:\0]/u.test(value) ||
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    value
      .split("/")
      .some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new Error(`Invalid repository-relative path: ${String(value)}`);
  }
  return value;
}

async function resolveRoot(root) {
  const requested = path.resolve(root);
  const actual = await realpath(requested);
  if (!(await stat(actual)).isDirectory()) {
    throw new Error(`Repository root is not a directory: ${requested}`);
  }
  return { requested, actual };
}

function resolveInput(input, root) {
  if (typeof input !== "string" || input.length === 0 || input.includes("\0")) {
    throw new Error("Expected a nonempty report or session path.");
  }
  const absolute = path.resolve(root.requested, input);
  const base = isInside(root.requested, absolute)
    ? root.requested
    : root.actual;
  if (!isInside(base, absolute)) {
    throw new Error(`Path is outside the repository root: ${input}`);
  }
  const relative = forwardSlashes(path.relative(base, absolute));
  validateRelativePath(relative);
  return { relative, absolute: path.resolve(root.actual, relative) };
}

async function existingPath(relative, root, kind) {
  validateRelativePath(relative);
  const absolute = path.resolve(root.actual, relative);
  const actual = await realpath(absolute);
  if (!isInside(root.actual, actual)) {
    throw new Error(`Path resolves outside the repository root: ${relative}`);
  }
  const info = await stat(actual);
  if (
    (kind === "file" && !info.isFile()) ||
    (kind === "directory" && !info.isDirectory())
  ) {
    throw new Error(`Expected a ${kind}: ${relative}`);
  }
  return actual;
}

function parseYaml(source, label) {
  const document = parseDocument(source, { strict: true, uniqueKeys: true });
  const diagnostics = [...document.errors, ...document.warnings];
  if (diagnostics.length > 0) {
    throw new Error(
      `Invalid YAML in ${label}: ${diagnostics.map((item) => item.message).join("; ")}`,
    );
  }
  try {
    return document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    throw new Error(`Invalid YAML in ${label}: ${error.message}`);
  }
}

function parseReport(source, label) {
  const normalized = source.replace(/^\uFEFF/u, "").replace(/\r\n/gu, "\n");
  const lines = normalized.split("\n");
  if (lines[0] !== "---") {
    throw new Error(`Missing YAML frontmatter at the start of ${label}.`);
  }
  const closing = lines.indexOf("---", 1);
  if (closing === -1) {
    throw new Error(`Missing closing YAML frontmatter delimiter in ${label}.`);
  }
  if (
    lines
      .slice(closing + 1)
      .join("\n")
      .trim() === ""
  ) {
    throw new Error(`Markdown body is empty in ${label}.`);
  }
  const metadata = parseYaml(lines.slice(1, closing).join("\n"), label);
  if (!validateMetadata(metadata)) {
    throw new Error(
      `Invalid metadata in ${label}: ${ajv.errorsText(validateMetadata.errors, { separator: "; " })}`,
    );
  }
  const result = metadata.checks.some((check) => check.result === "fail")
    ? "fail"
    : metadata.checks.some((check) => check.result === "blocked")
      ? "blocked"
      : "pass";
  if (metadata.result !== result) {
    throw new Error(
      `Result does not match checks in ${label}: expected ${result}.`,
    );
  }
  if (
    metadata.checks.some(
      (check) =>
        check.result === "pass" &&
        Object.hasOwn(check, "exit_code") &&
        check.exit_code !== 0,
    )
  ) {
    throw new Error(`A passing check has a nonzero exit_code in ${label}.`);
  }
  return metadata;
}

async function readTaskStatus(task, root) {
  if (task === null) return null;
  const actual = await existingPath(task, root, "file");
  const source = (await readFile(actual, "utf8"))
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n/gu, "\n");
  const header = source.split("\n").find((line) => /^#\s/u.test(line));
  const headerStatus = header?.match(/\bstatus\s*:\s*([^\s]+)\s*$/iu)?.[1];
  const separateStatus = source.match(/^Status:\s*([^\s]+)\s*$/imu)?.[1];
  if (headerStatus && separateStatus && headerStatus !== separateStatus) {
    throw new Error(`Conflicting task statuses in ${task}.`);
  }
  const status = headerStatus ?? separateStatus;
  if (!taskStatuses.has(status)) {
    throw new Error(`Missing or invalid task status in ${task}.`);
  }
  return status;
}

async function collectReports(inputs, root) {
  const reports = new Set();
  for (const input of inputs) {
    const { relative } = resolveInput(input, root);
    const actual = await existingPath(relative, root);
    const info = await stat(actual);
    if (info.isFile()) {
      if (!relative.endsWith(".md")) {
        throw new Error(`Expected a Markdown report: ${relative}`);
      }
      reports.add(relative);
      continue;
    }
    if (!info.isDirectory() || !sessionPattern.test(relative)) {
      throw new Error(`Expected a report or session directory: ${relative}`);
    }
    const directory = await existingPath(
      `${relative}/results`,
      root,
      "directory",
    );
    const entries = (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.name.endsWith(".md") && !entry.isDirectory())
      .map((entry) => `${relative}/results/${entry.name}`)
      .sort();
    if (entries.length === 0) {
      throw new Error(`No Markdown reports found in ${relative}/results.`);
    }
    for (const entry of entries) reports.add(entry);
  }
  return [...reports].sort();
}

export async function loadResults(inputs, { root = repositoryRoot } = {}) {
  if (!Array.isArray(inputs) || inputs.length === 0) {
    throw new Error("At least one report or session path is required.");
  }
  const resolvedRoot = await resolveRoot(root);
  const paths = await collectReports(inputs, resolvedRoot);
  const reports = [];
  const tuples = new Set();
  const statuses = new Map();
  for (const relative of paths) {
    const actual = await existingPath(relative, resolvedRoot, "file");
    const metadata = parseReport(await readFile(actual, "utf8"), relative);
    const directory = `.agents/project/sessions/${metadata.run}/results`;
    if (
      !relative.startsWith(`${directory}/`) ||
      !isInside(path.resolve(resolvedRoot.actual, directory), actual)
    ) {
      throw new Error(`Report must be inside ${directory}: ${relative}`);
    }
    const tuple = JSON.stringify([
      metadata.run,
      metadata.task,
      metadata.role,
      metadata.attempt,
    ]);
    if (tuples.has(tuple)) {
      throw new Error(
        `Duplicate report tuple (run/task/role/attempt) in ${relative}.`,
      );
    }
    tuples.add(tuple);
    for (const reference of [
      ...metadata.revision.evidence,
      ...metadata.artifacts,
    ]) {
      await existingPath(reference, resolvedRoot, "file");
    }
    if (!statuses.has(metadata.task)) {
      statuses.set(
        metadata.task,
        await readTaskStatus(metadata.task, resolvedRoot),
      );
    }
    reports.push({
      path: relative,
      metadata,
      taskStatus: statuses.get(metadata.task),
    });
  }
  return reports;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function buildSummary(reports) {
  const groups = new Map();
  for (const report of reports) {
    const { metadata, taskStatus } = report;
    const key = JSON.stringify([metadata.task, metadata.run]);
    let group = groups.get(key);
    if (!group) {
      group = {
        task: metadata.task,
        run: metadata.run,
        task_status: metadata.task === null ? null : taskStatus,
        reports: Object.fromEntries(roles.map((role) => [role, null])),
        missing_roles: [],
      };
      groups.set(key, group);
    } else if (
      group.task_status !== (metadata.task === null ? null : taskStatus)
    ) {
      throw new Error(`Conflicting task statuses for ${metadata.task}.`);
    }
    const previous = group.reports[metadata.role];
    if (!previous || metadata.attempt > previous.attempt) {
      group.reports[metadata.role] = {
        result: metadata.result,
        attempt: metadata.attempt,
        report: report.path,
        revision: structuredClone(metadata.revision),
      };
    } else if (
      metadata.attempt === previous.attempt &&
      report.path !== previous.report
    ) {
      throw new Error(
        `Duplicate report tuple (run/task/role/attempt) in ${report.path}.`,
      );
    }
  }
  const tasks = [...groups.values()].sort(
    (left, right) =>
      compareText(left.task ?? "", right.task ?? "") ||
      compareText(left.run, right.run),
  );
  for (const task of tasks) {
    task.missing_roles = roles.filter((role) => task.reports[role] === null);
  }
  return { schema_version: 1, kind: "agent-summary", tasks };
}

export async function writeSummary(
  summary,
  output,
  { root = repositoryRoot } = {},
) {
  if (
    summary?.schema_version !== 1 ||
    summary.kind !== "agent-summary" ||
    !Array.isArray(summary.tasks) ||
    summary.tasks.length === 0
  ) {
    throw new Error("Expected a nonempty agent-summary v1.");
  }
  validateRelativePath(output);
  const resolvedRoot = await resolveRoot(root);
  const { relative, absolute } = resolveInput(output, resolvedRoot);
  const run = summaryPattern.exec(relative)?.[1];
  if (!run || summary.tasks.some((task) => task?.run !== run)) {
    throw new Error(
      "Summary output must be .agents/project/sessions/<run>/summary.yaml for every task run.",
    );
  }
  const parent = await realpath(path.dirname(absolute));
  if (!isInside(resolvedRoot.actual, parent)) {
    throw new Error(
      `Summary output parent resolves outside the repository root: ${relative}`,
    );
  }
  const target = path.join(parent, "summary.yaml");
  const content = stringify(summary);
  let existing;
  try {
    existing = await lstat(target, { bigint: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (
    existing &&
    (!existing.isFile() || existing.isSymbolicLink() || existing.nlink !== 1n)
  ) {
    throw new Error(
      `Refusing to overwrite a nonregular or linked summary: ${relative}`,
    );
  }
  // Дескриптор привязывает проверку содержимого к тому же файлу, который будет перезаписан.
  const handle = await open(
    target,
    existing ? constants.O_RDWR | (constants.O_NOFOLLOW ?? 0) : "wx",
  );
  try {
    if (existing) {
      const opened = await handle.stat({ bigint: true });
      // На Windows lstat может вернуть dev=0; inode сравнивается без потери точности.
      if (
        opened.ino !== existing.ino ||
        (existing.dev !== 0n && opened.dev !== existing.dev)
      ) {
        throw new Error(`Summary output changed while opening it: ${relative}`);
      }
      const previous = parseYaml(await handle.readFile("utf8"), relative);
      if (
        previous?.kind !== "agent-summary" ||
        previous.schema_version !== 1 ||
        !Array.isArray(previous.tasks) ||
        previous.tasks.length === 0 ||
        previous.tasks.some((task) => task?.run !== run)
      ) {
        throw new Error(
          `Refusing to overwrite a file that is not agent-summary v1 for run ${run}: ${relative}`,
        );
      }
      await handle.truncate(0);
    }
    const buffer = Buffer.from(content, "utf8");
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesWritten } = await handle.write(
        buffer,
        offset,
        buffer.length - offset,
        offset,
      );
      if (bytesWritten === 0)
        throw new Error(`Unable to finish writing summary: ${relative}`);
      offset += bytesWritten;
    }
  } finally {
    await handle.close();
  }
  return relative;
}
