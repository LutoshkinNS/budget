const commands = new Set([
  "frontend-module",
  "frontend-page",
  "module",
  "page",
]);

const knownFlags = new Set([
  "--force",
  "--dry-run",
  "--parent",
  "--private",
  "--public",
  "--title",
]);

export function usage() {
  return `Usage:
  pnpm --filter @budget/frontend scaffold frontend-page <page-name> [--private|--public] [--title <title>] [--dry-run] [--force]
  pnpm --filter @budget/frontend scaffold frontend-module <module-name> [--parent <module-path>] [--title <title>] [--dry-run] [--force]

Examples:
  pnpm --filter @budget/frontend scaffold frontend-page budgets --private --title "Budgets"
  pnpm --filter @budget/frontend scaffold page reports --public --dry-run
  pnpm --filter @budget/frontend scaffold frontend-module budgets --title "Budgets"
  pnpm --filter @budget/frontend scaffold frontend-module period-summary --parent expenses --title "Period Summary"
  pnpm --filter @budget/frontend scaffold module reports --dry-run`;
}

export function parseArgs(argv) {
  const [command, rawName, ...rest] = argv;

  if (!commands.has(command) || !rawName) {
    throw new Error(usage());
  }

  const options = {
    command,
    rawName,
    scope: "private",
    force: false,
    dryRun: false,
    parent: null,
    title: null,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--title") {
      const title = rest[index + 1];
      if (!title || title.startsWith("--")) {
        throw new Error("Missing value for --title.");
      }
      options.title = title;
      index += 1;
      continue;
    }

    if (arg?.startsWith("--title=")) {
      options.title = arg.slice("--title=".length);
      continue;
    }

    if (arg === "--parent") {
      const parent = rest[index + 1];
      if (!parent || parent.startsWith("--")) {
        throw new Error("Missing value for --parent.");
      }
      options.parent = parent;
      index += 1;
      continue;
    }

    if (arg?.startsWith("--parent=")) {
      options.parent = arg.slice("--parent=".length);
      continue;
    }

    if (!knownFlags.has(arg)) {
      throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
    }

    if (arg === "--private") {
      options.scope = "private";
    }

    if (arg === "--public") {
      options.scope = "public";
    }

    if (arg === "--force") {
      options.force = true;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  if (rest.includes("--private") && rest.includes("--public")) {
    throw new Error("Choose either --private or --public, not both.");
  }

  if (isModuleCommand(command)) {
    const pageOnlyFlags = ["--private", "--public"].filter((flag) =>
      rest.includes(flag),
    );

    if (pageOnlyFlags.length > 0) {
      throw new Error(
        `${pageOnlyFlags.join(", ")} can only be used with frontend-page.`,
      );
    }
  }

  if (isPageCommand(command) && options.parent) {
    throw new Error("--parent can only be used with frontend-module.");
  }

  return options;
}

export function isPageCommand(command) {
  return command === "frontend-page" || command === "page";
}

export function isModuleCommand(command) {
  return command === "frontend-module" || command === "module";
}
