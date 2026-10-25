import { stringify } from "yaml";

import { buildSummary, loadResults, writeSummary } from "./agent-results.mjs";

const help = `Usage:
  node .agents/supervisor/scripts/agent-results-cli.mjs check <report.md|session>...
  node .agents/supervisor/scripts/agent-results-cli.mjs summary <report.md|session>... [--output <path>]

Options:
  --output <path>  Save summary to that report session's summary.yaml
  --help           Show this help
`;

function parseArguments(args) {
  let command;
  let output;
  let showHelp = false;
  const inputs = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help") {
      showHelp = true;
    } else if (argument === "--output") {
      if (output !== undefined)
        throw new Error("Option --output may only be provided once.");
      const value = args[index + 1];
      if (!value || value.startsWith("-"))
        throw new Error("Option --output requires a path.");
      output = value;
      index += 1;
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (command === undefined) {
      command = argument;
    } else {
      inputs.push(argument);
    }
  }
  if (command !== undefined && command !== "check" && command !== "summary") {
    throw new Error(`Unknown command: ${command}`);
  }
  if (output !== undefined && command !== "summary") {
    throw new Error("Option --output is only supported by summary.");
  }
  if (!showHelp && (command === undefined || inputs.length === 0)) {
    throw new Error(
      "Expected check or summary and at least one report or session path.",
    );
  }
  return { command, inputs, output, showHelp };
}

try {
  const { command, inputs, output, showHelp } = parseArguments(
    process.argv.slice(2),
  );
  if (showHelp) {
    process.stdout.write(help);
  } else {
    const reports = await loadResults(inputs);
    if (command === "check") {
      process.stdout.write(`Validated ${reports.length} agent report(s).\n`);
    } else {
      const summary = buildSummary(reports);
      if (output === undefined) {
        process.stdout.write(stringify(summary));
      } else {
        const saved = await writeSummary(summary, output);
        process.stdout.write(`Summary written to ${saved}\n`);
      }
    }
  }
} catch (error) {
  process.stderr.write(`Error: ${error.message}\n`);
  process.exitCode = 1;
}
