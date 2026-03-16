import { createFileRoute } from "@tanstack/react-router";

import { Settings } from "@/pages/settings";

export const Route = createFileRoute("/_private/settings")({
  component: Settings,
});
