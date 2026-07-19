import path from "node:path";
import { fileURLToPath } from "node:url";

import { toKebabCase, validateSlug } from "./naming.mjs";

export function getFrontendRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

export function getPageDir(frontendRoot, slug) {
  return path.join(frontendRoot, "src/pages", slug);
}

export function getRouteDir(frontendRoot, scope) {
  const routeGroup = scope === "public" ? "_public" : "_private";
  return path.join(frontendRoot, "src/app/routes", routeGroup);
}

export function getParentModuleSegments(rawParentPath) {
  if (!rawParentPath) {
    return [];
  }

  if (path.isAbsolute(rawParentPath)) {
    throw new Error("--parent must be relative to src/modules.");
  }

  const segments = rawParentPath
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .map((segment) => toKebabCase(segment));

  if (segments.length === 0) {
    throw new Error("--parent must include a module path.");
  }

  for (const segment of segments) {
    validateSlug(segment, "Parent module path segment");
  }

  return segments;
}

export function getModuleDir(frontendRoot, parent, slug) {
  const parentSegments = getParentModuleSegments(parent);

  if (parentSegments.length === 0) {
    return path.join(frontendRoot, "src/modules", slug);
  }

  return path.join(
    frontendRoot,
    "src/modules",
    ...parentSegments,
    "modules",
    slug,
  );
}
