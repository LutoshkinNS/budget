import { type ReactNode, useEffect, useRef, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { createApiRuntime } from "@/common/api/api-runtime.ts";
import { ApiRuntimeContext } from "@/common/api/api-runtime-context.tsx";
import { Notifications, useNotifications } from "@/common/lib/notifications";

export function QueryProvider({ children }: { children: ReactNode }) {
  const { notifications, addNotification, deleteNotification } =
    useNotifications();
  const [runtime] = useState(() =>
    createApiRuntime({
      fetch: (input, init) => globalThis.fetch(input, init),
      notifyError: addNotification,
    }),
  );
  const ownerGeneration = useRef(0);

  useEffect(() => {
    ownerGeneration.current += 1;
    const generation = ownerGeneration.current;

    return () => {
      queueMicrotask(() => {
        if (ownerGeneration.current === generation) runtime.dispose();
      });
    };
  }, [runtime]);

  return (
    <ApiRuntimeContext.Provider value={runtime}>
      <QueryClientProvider client={runtime.queryClient}>
        {children}
        <Notifications
          notifications={notifications}
          onClose={deleteNotification}
        />
      </QueryClientProvider>
    </ApiRuntimeContext.Provider>
  );
}
