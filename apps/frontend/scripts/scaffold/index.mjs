import { pathToFileURL } from "node:url";

import { buildFrontendModuleFiles } from "./builders/module.mjs";
import { buildFrontendPageFiles } from "./builders/page.mjs";
import { isPageCommand, parseArgs } from "./cli.mjs";
import { writeFiles } from "./writer.mjs";

export async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const files = isPageCommand(options.command)
    ? buildFrontendPageFiles(options)
    : buildFrontendModuleFiles(options);

  await writeFiles(files, options);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
