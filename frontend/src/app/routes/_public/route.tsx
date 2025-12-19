import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout } from "@/app/layouts/public.tsx";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});
