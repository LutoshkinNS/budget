import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  return <div className="p-2">Hello from Categories!</div>;
}
