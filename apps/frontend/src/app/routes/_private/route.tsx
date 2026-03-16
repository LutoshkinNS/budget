import { createFileRoute } from "@tanstack/react-router";

import { PrivateLayout } from "../../layouts/private.tsx";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
});
