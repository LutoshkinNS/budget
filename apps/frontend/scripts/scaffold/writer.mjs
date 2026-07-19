import fs from "node:fs/promises";
import path from "node:path";

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeFiles(files, { dryRun, force }) {
  const existing = [];

  for (const file of files) {
    if (await fileExists(file.path)) {
      existing.push(file.path);
    }
  }

  if (existing.length > 0 && !force && !dryRun) {
    throw new Error(
      `Refusing to overwrite existing files. Use --force to replace them:\n${existing
        .map((filePath) => `  ${path.relative(process.cwd(), filePath)}`)
        .join("\n")}`,
    );
  }

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file.path);

    if (dryRun) {
      const action = existing.includes(file.path)
        ? "Would keep"
        : "Would create";
      console.log(`${action} ${relativePath}`);
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
