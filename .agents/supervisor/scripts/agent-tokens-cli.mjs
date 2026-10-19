import { lstat, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderMarkdown, runTokens } from "./agent-tokens.mjs";

const help = `Usage:\n  pnpm agents:tokens start <session> --task <task.md> --thread <thread-id> [--sessions-root <dir>]\n  pnpm agents:tokens attach <session> --task <task.md> --thread <thread-id> --role <role> --attempt <0-3> [--from-start] [--sessions-root <dir>]\n  pnpm agents:tokens stop <session> --thread <thread-id> [--sessions-root <dir>]\n  pnpm agents:tokens report <session> [--format json|markdown] [--output <path>] [--sessions-root <dir>]\n\nOptions:\n  --help  Show this help\n`;

function parse(args) {
  const options = { format: "json", fromStart: false };
  const seenOptions = new Set();
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--help") return { help: true };
    if (value === "--from-start") {
      options.fromStart = true;
      continue;
    }
    if (
      [
        "--task",
        "--thread",
        "--role",
        "--attempt",
        "--sessions-root",
        "--format",
        "--output",
      ].includes(value)
    ) {
      if (seenOptions.has(value))
        throw new Error(`Option ${value} may only be provided once.`);
      seenOptions.add(value);
      const next = args[index + 1];
      if (!next || next.startsWith("--"))
        throw new Error(`Option ${value} requires a value.`);
      options[value.slice(2).replaceAll("-", "")] =
        value === "--attempt" ? Number(next) : next;
      if (value === "--sessions-root") options.sessionsRoot = next;
      if (value === "--from-start") options.fromStart = true;
      index += 1;
    } else if (value.startsWith("-"))
      throw new Error(`Unknown option: ${value}`);
    else positional.push(value);
  }
  const command = positional.shift();
  const session = positional.shift();
  if (
    !new Set(["start", "attach", "stop", "report"]).has(command) ||
    !session ||
    positional.length
  )
    throw new Error("Expected a command and one session path.");
  if (options.format !== "json" && options.format !== "markdown")
    throw new Error("Option --format must be json or markdown.");
  if (options.format !== "json" && options.output?.endsWith(".json"))
    throw new Error("Markdown format requires a .md output path.");
  if (options.format === "json" && options.output?.endsWith(".md"))
    throw new Error("JSON format requires a .json output path.");
  return { command, session, options };
}

async function writeReport(output, session, report, format) {
  const relativeSession = session.replaceAll("\\", "/");
  const expected = `${relativeSession}/tokens.${format === "json" ? "json" : "md"}`;
  if (output.replaceAll("\\", "/") !== expected)
    throw new Error(`Output must be ${expected}.`);
  const root = await realpath(process.cwd());
  const target = path.resolve(root, output);
  const sessionDir = await realpath(path.resolve(root, session));
  const parent = await realpath(path.dirname(target));
  if (parent !== sessionDir)
    throw new Error("Output path must resolve inside the session directory.");
  const content =
    format === "json"
      ? `${JSON.stringify(report, null, 2)}\n`
      : renderMarkdown(report);
  let info;
  try {
    info = await lstat(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (info && (!info.isFile() || info.isSymbolicLink() || info.nlink > 1n))
    throw new Error("Refusing to overwrite a linked or non-file output.");
  if (info) {
    if (format === "json") {
      const previous = JSON.parse(await readFile(target, "utf8"));
      if (
        previous.kind !== "task-token-report" ||
        previous.schema_version !== 1 ||
        previous.run !== report.run
      )
        throw new Error("Refusing to overwrite an unrelated report.");
    } else if (
      !(await readFile(target, "utf8")).startsWith(
        `# Учёт токенов: ${report.run}\n`,
      )
    )
      throw new Error("Refusing to overwrite an unrelated report.");
  }
  await writeFile(target, content, { flag: info ? "w" : "wx" });
}

try {
  const parsed = parse(process.argv.slice(2));
  if (parsed.help) process.stdout.write(help);
  else {
    const { command, session, options } = parsed;
    const result = await runTokens(command, { ...options, session });
    if (command === "report") {
      const output =
        options.format === "markdown"
          ? renderMarkdown(result)
          : `${JSON.stringify(result, null, 2)}\n`;
      if (options.output)
        await writeReport(options.output, session, result, options.format);
      else process.stdout.write(output);
    } else
      process.stdout.write(
        `${command === "start" ? "Started" : command === "attach" ? "Attached" : "Stopped"} token accounting.\n`,
      );
  }
} catch (error) {
  process.stderr.write(`Error: ${error.message}\n`);
  process.exitCode = 1;
}
