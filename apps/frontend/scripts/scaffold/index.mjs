import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const commands = new Set(["frontend-page", "page"]);
const knownFlags = new Set(["--private", "--public", "--force", "--dry-run"]);

function usage() {
  return `Usage:
  pnpm --filter @budget/frontend scaffold frontend-page <page-name> [--private|--public] [--title <title>] [--dry-run] [--force]

Examples:
  pnpm --filter @budget/frontend scaffold frontend-page budgets --private --title "Budgets"
  pnpm --filter @budget/frontend scaffold page reports --public --dry-run`;
}

function toKebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toPascalCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toStartCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseArgs(argv) {
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

  return options;
}

function buildFrontendPageFiles({ rawName, scope, title }) {
  const slug = toKebabCase(rawName);

  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    throw new Error(
      "Page name must resolve to kebab-case: letters, numbers, and hyphens only.",
    );
  }

  const componentName = toPascalCase(slug);
  const pageTitle = title ?? toStartCase(slug);
  const routeGroup = scope === "public" ? "_public" : "_private";
  const frontendRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );

  const pageDir = path.join(frontendRoot, "src/pages", slug);
  const routeDir = path.join(frontendRoot, "src/app/routes", routeGroup);

  return [
    {
      path: path.join(pageDir, `${componentName}.tsx`),
      content: `import s from "./${componentName}.module.css";

export function ${componentName}() {
  return (
    <div className={s.container}>
      <h1 className={s.title}>${pageTitle}</h1>
    </div>
  );
}
`,
    },
    {
      path: path.join(pageDir, `${componentName}.module.css`),
      content: `.container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.title {
    font-size: 24px;
    font-weight: 400;
    line-height: 28px;
    margin: 0;
}
`,
    },
    {
      path: path.join(pageDir, "index.ts"),
      content: `export { ${componentName} } from "./${componentName}.tsx";
`,
    },
    {
      path: path.join(routeDir, `${slug}.tsx`),
      content: `import { createFileRoute } from "@tanstack/react-router";

import { ${componentName} } from "@/pages/${slug}";

export const Route = createFileRoute("/${routeGroup}/${slug}")({
  component: ${componentName},
});
`,
    },
  ];
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeFiles(files, { dryRun, force }) {
  const existing = [];

  for (const file of files) {
    if (await fileExists(file.path)) {
      existing.push(file.path);
    }
  }

  if (existing.length > 0 && !force) {
    throw new Error(
      `Refusing to overwrite existing files. Use --force to replace them:\n${existing
        .map((filePath) => `  ${path.relative(process.cwd(), filePath)}`)
        .join("\n")}`,
    );
  }

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file.path);

    if (dryRun) {
      console.log(`Would create ${relativePath}`);
      continue;
    }

    await fs.mkdir(path.dirname(file.path), { recursive: true });
    await fs.writeFile(
      file.path,
      file.content,
      force ? "utf8" : { flag: "wx" },
    );
    console.log(`Created ${relativePath}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = buildFrontendPageFiles(options);
  await writeFiles(files, options);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
