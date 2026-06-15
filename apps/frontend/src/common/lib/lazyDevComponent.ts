import { type ComponentType, lazy } from "react";

export function lazyDevComponent<TModule, TProps extends object>(
  load: () => Promise<TModule>,
  select: (module: TModule) => ComponentType<TProps>,
) {
  if (!import.meta.env.DEV) return null;

  return lazy(() =>
    load().then((module) => ({
      default: select(module),
    })),
  );
}
