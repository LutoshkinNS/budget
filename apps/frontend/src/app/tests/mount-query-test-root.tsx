import { StrictMode, useLayoutEffect } from "react";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import { QueryTestRoot } from "./query-test-root";

export function mountQueryTestRoot(children?: React.ReactNode, strict = false) {
  let captured: QueryClient | undefined;
  function ClientProbe() {
    const client = useQueryClient();
    useLayoutEffect(() => {
      captured = client;
    }, [client]);
    return null;
  }
  const tree = (content?: React.ReactNode) => {
    const root = (
      <QueryTestRoot>
        <ClientProbe />
        {content}
      </QueryTestRoot>
    );
    return strict ? <StrictMode>{root}</StrictMode> : root;
  };
  const view = render(tree(children));
  const client = captured;
  if (!client) throw new Error("QueryProvider did not expose its client");
  return {
    ...view,
    client,
    rerenderChildren: (content: React.ReactNode) =>
      view.rerender(tree(content)),
  };
}
