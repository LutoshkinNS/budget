import { createContext, useContext } from "react";

import type { ApiRuntime } from "./api-runtime.ts";

export const ApiRuntimeContext = createContext<ApiRuntime | null>(null);

export function useApiRuntime(): ApiRuntime {
  const runtime = useContext(ApiRuntimeContext);
  if (!runtime) throw new Error("ApiRuntimeContext is missing");
  return runtime;
}
