import path from "node:path";

import {
  toKebabCase,
  toPascalCase,
  toStartCase,
  validateSlug,
} from "../naming.mjs";
import { getFrontendRoot, getPageDir, getRouteDir } from "../paths.mjs";

export function buildFrontendPageFiles({ rawName, scope, title }) {
  const slug = toKebabCase(rawName);
  validateSlug(slug, "Page");

  const componentName = toPascalCase(slug);
  const pageTitle = title ?? toStartCase(slug);
  const routeGroup = scope === "public" ? "_public" : "_private";
  const frontendRoot = getFrontendRoot();
  const pageDir = getPageDir(frontendRoot, slug);
  const routeDir = getRouteDir(frontendRoot, scope);

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
