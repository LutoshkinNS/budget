import { ComponentType, lazy, Suspense } from "react";

import { Loader } from "./loader/Loader";

export function makeLazy<M, P extends object>(
  factory: () => Promise<M>,
  exportName?: keyof M,
) {
  const Component = lazy(() =>
    factory().then((m) => ({
      default: (exportName ? m[exportName] : m) as ComponentType<P>,
    })),
  );

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
