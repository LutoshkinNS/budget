import path from "node:path";

import {
  toKebabCase,
  toPascalCase,
  toStartCase,
  validateSlug,
} from "../naming.mjs";
import { getFrontendRoot, getModuleDir } from "../paths.mjs";

export function buildFrontendModuleFiles({ rawName, parent, title }) {
  const slug = toKebabCase(rawName);
  validateSlug(slug, "Module");

  const componentName = toPascalCase(slug);
  const moduleTitle = title ?? toStartCase(slug);
  const frontendRoot = getFrontendRoot();
  const moduleDir = getModuleDir(frontendRoot, parent, slug);

  return [
    {
      path: path.join(moduleDir, "index.ts"),
      content: `export { ${componentName} } from "./ui/${componentName}.tsx";
export type { ${componentName}Props } from "./model/types.ts";
`,
    },
    {
      path: path.join(moduleDir, "model/types.ts"),
      content: `export type ${componentName}Props = {
  title?: string;
};
`,
    },
    {
      path: path.join(moduleDir, `ui/${componentName}.tsx`),
      content: `import type { ${componentName}Props } from "../model/types.ts";

import s from "./${componentName}.module.css";

export function ${componentName}({ title = "${moduleTitle}" }: ${componentName}Props) {
  return (
    <section className={s.root}>
      <h2 className={s.title}>{title}</h2>
    </section>
  );
}
`,
    },
    {
      path: path.join(moduleDir, `ui/${componentName}.module.css`),
      content: `.root {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.title {
    font-size: 20px;
    font-weight: 400;
    line-height: 24px;
    margin: 0;
}
`,
    },
  ];
}
